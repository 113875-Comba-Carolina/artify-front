import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CarritoItem {
  producto: {
    id: number;
    nombre: string;
    precio: number;
    imagenUrl?: string;
    categoria: string;
  };
  cantidad: number;
  subtotal: number;
}

export interface ItemCarritoRequest {
  productoId: number;
  cantidad: number;
}

export interface CarritoResponse {
  id: number;
  usuarioId: number;
  items: {
    id: number;
    producto: {
      id: number;
      nombre: string;
      precio: number;
      imagenUrl?: string;
      categoria: string;
      stockDisponible: number;
    };
    cantidad: number;
    subtotal: number;
  }[];
  cantidadTotal: number;
  totalCarrito: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private apiUrl = environment.apiUrl;
  private carritoSubject = new BehaviorSubject<CarritoItem[]>([]);
  public carrito$ = this.carritoSubject.asObservable();
  private isLoggedIn = false;

  constructor(private http: HttpClient) {
    // Cargar carrito desde localStorage al inicializar
    this.cargarCarritoDesdeStorage();
    // Verificar si el usuario está logueado
    this.checkLoginStatus();
  }

  private checkLoginStatus(): void {
    this.isLoggedIn = !!localStorage.getItem('auth');
    
    // Si el usuario está logueado, sincronizar con el backend
    if (this.isLoggedIn) {
      this.sincronizarConBackend();
    }
  }

  /**
   * Sincroniza el carrito local con el backend cuando el usuario inicia sesión
   */
  public sincronizarConBackend(): void {
    const carritoLocal = this.carritoSubject.value;
    
    if (carritoLocal.length > 0) {
      // Hay items locales, sincronizar con el servidor
      const itemsRequest: ItemCarritoRequest[] = carritoLocal.map(item => ({
        productoId: item.producto.id,
        cantidad: item.cantidad
      }));
      
      this.sincronizarCarrito(itemsRequest).subscribe({
        next: (response) => {
          this.actualizarCarritoDesdeBackend(response);
          // Limpiar localStorage después de sincronizar
          localStorage.removeItem('carrito');
        },
        error: (error) => {
          console.error('Error al sincronizar carrito:', error);
          // Si falla la sincronización, cargar el carrito del servidor
          this.cargarCarritoDesdeBackend();
        }
      });
    } else {
      // No hay items locales, simplemente cargar del servidor
      this.cargarCarritoDesdeBackend();
    }
  }

  /**
   * Carga el carrito desde el backend
   */
  private cargarCarritoDesdeBackend(): void {
    this.obtenerCarrito().subscribe({
      next: (response) => {
        this.actualizarCarritoDesdeBackend(response);
      },
      error: (error) => {
        console.error('Error al cargar carrito desde backend:', error);
      }
    });
  }

  /**
   * Actualiza el estado del carrito con la respuesta del backend
   */
  private actualizarCarritoDesdeBackend(response: CarritoResponse): void {
    const items: CarritoItem[] = response.items.map(item => ({
      producto: {
        id: item.producto.id,
        nombre: item.producto.nombre,
        precio: item.producto.precio,
        imagenUrl: item.producto.imagenUrl,
        categoria: item.producto.categoria
      },
      cantidad: item.cantidad,
      subtotal: item.subtotal
    }));
    
    this.carritoSubject.next(items);
  }

  // ========== MÉTODOS PÚBLICOS ==========

  // Obtener items del carrito
  getCarrito(): CarritoItem[] {
    return this.carritoSubject.value;
  }

  // Obtener cantidad total de items
  getCantidadTotal(): number {
    return this.carritoSubject.value.reduce((total, item) => total + item.cantidad, 0);
  }

  // Obtener total del carrito
  getTotalCarrito(): number {
    return this.carritoSubject.value.reduce((total, item) => total + item.subtotal, 0);
  }

  // Agregar producto al carrito
  agregarAlCarrito(producto: any, cantidad: number = 1): void {
    this.isLoggedIn = !!localStorage.getItem('auth');
    
    if (this.isLoggedIn) {
      // Usuario logueado: guardar en backend
      const request: ItemCarritoRequest = {
        productoId: producto.id,
        cantidad: cantidad
      };
      
      this.agregarAlCarritoBackend(request).subscribe({
        next: (response) => {
          this.actualizarCarritoDesdeBackend(response);
        },
        error: (error) => {
          console.error('Error al agregar al carrito:', error);
          // Fallback a localStorage si falla el backend
          this.agregarAlCarritoLocal(producto, cantidad);
        }
      });
    } else {
      // Usuario no logueado: guardar en localStorage
      this.agregarAlCarritoLocal(producto, cantidad);
    }
  }

  private agregarAlCarritoLocal(producto: any, cantidad: number): void {
    const carritoActual = this.carritoSubject.value;
    const itemExistente = carritoActual.find(item => item.producto.id === producto.id);

    if (itemExistente) {
      itemExistente.cantidad += cantidad;
      itemExistente.subtotal = itemExistente.producto.precio * itemExistente.cantidad;
    } else {
      const nuevoItem: CarritoItem = {
        producto: {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagenUrl: producto.imagenUrl,
          categoria: producto.categoria
        },
        cantidad: cantidad,
        subtotal: producto.precio * cantidad
      };
      carritoActual.push(nuevoItem);
    }

    this.carritoSubject.next([...carritoActual]);
    this.guardarCarritoEnStorage();
  }

  // Actualizar cantidad de un item
  actualizarCantidad(productoId: number, nuevaCantidad: number): void {
    this.isLoggedIn = !!localStorage.getItem('auth');
    
    if (this.isLoggedIn) {
      // Usuario logueado: actualizar en backend
      this.actualizarCantidadBackend(productoId, nuevaCantidad).subscribe({
        next: (response) => {
          this.actualizarCarritoDesdeBackend(response);
        },
        error: (error) => {
          console.error('Error al actualizar cantidad:', error);
          // Fallback a localStorage
          this.actualizarCantidadLocal(productoId, nuevaCantidad);
        }
      });
    } else {
      // Usuario no logueado: actualizar en localStorage
      this.actualizarCantidadLocal(productoId, nuevaCantidad);
    }
  }

  private actualizarCantidadLocal(productoId: number, nuevaCantidad: number): void {
    const carritoActual = this.carritoSubject.value;
    const item = carritoActual.find(item => item.producto.id === productoId);

    if (item) {
      if (nuevaCantidad <= 0) {
        this.eliminarDelCarrito(productoId);
      } else {
        item.cantidad = nuevaCantidad;
        item.subtotal = item.producto.precio * item.cantidad;
        this.carritoSubject.next([...carritoActual]);
        this.guardarCarritoEnStorage();
      }
    }
  }

  // Eliminar producto del carrito
  eliminarDelCarrito(productoId: number): void {
    this.isLoggedIn = !!localStorage.getItem('auth');
    
    if (this.isLoggedIn) {
      // Usuario logueado: eliminar del backend
      this.eliminarDelCarritoBackend(productoId).subscribe({
        next: (response) => {
          this.actualizarCarritoDesdeBackend(response);
        },
        error: (error) => {
          console.error('Error al eliminar del carrito:', error);
          // Fallback a localStorage
          this.eliminarDelCarritoLocal(productoId);
        }
      });
    } else {
      // Usuario no logueado: eliminar de localStorage
      this.eliminarDelCarritoLocal(productoId);
    }
  }

  private eliminarDelCarritoLocal(productoId: number): void {
    const carritoActual = this.carritoSubject.value;
    const carritoFiltrado = carritoActual.filter(item => item.producto.id !== productoId);
    this.carritoSubject.next(carritoFiltrado);
    this.guardarCarritoEnStorage();
  }

  // Limpiar carrito
  limpiarCarrito(): void {
    console.log('Limpiando carrito...');
    this.isLoggedIn = !!localStorage.getItem('auth');
    
    if (this.isLoggedIn) {
      // Usuario logueado: limpiar en backend
      this.limpiarCarritoBackend().subscribe({
        next: (response) => {
          this.actualizarCarritoDesdeBackend(response);
          console.log('Carrito limpiado exitosamente');
        },
        error: (error) => {
          console.error('Error al limpiar carrito:', error);
          // Fallback a localStorage
          this.limpiarCarritoLocal();
        }
      });
    } else {
      // Usuario no logueado: limpiar localStorage
      this.limpiarCarritoLocal();
    }
  }

  private limpiarCarritoLocal(): void {
    this.carritoSubject.next([]);
    this.guardarCarritoEnStorage();
    console.log('Carrito limpiado exitosamente');
  }

  // Forzar limpieza del carrito (para casos de compra exitosa)
  forzarLimpiezaCarrito(): void {
    console.log('Forzando limpieza del carrito...');
    this.isLoggedIn = !!localStorage.getItem('auth');
    
    if (this.isLoggedIn) {
      this.limpiarCarritoBackend().subscribe({
        next: () => {
          this.carritoSubject.next([]);
          localStorage.removeItem('carrito');
          console.log('Carrito forzadamente limpiado');
        },
        error: (error) => {
          console.error('Error al limpiar carrito:', error);
          // Limpiar localmente de todas formas
          this.carritoSubject.next([]);
          localStorage.removeItem('carrito');
        }
      });
    } else {
      this.carritoSubject.next([]);
      localStorage.removeItem('carrito');
      console.log('Carrito forzadamente limpiado');
    }
  }

  // Verificar si un producto está en el carrito
  estaEnCarrito(productoId: number): boolean {
    return this.carritoSubject.value.some(item => item.producto.id === productoId);
  }

  // Obtener cantidad de un producto específico en el carrito
  getCantidadProducto(productoId: number): number {
    const item = this.carritoSubject.value.find(item => item.producto.id === productoId);
    return item ? item.cantidad : 0;
  }

  // Guardar carrito en localStorage (solo para usuarios no logueados)
  private guardarCarritoEnStorage(): void {
    localStorage.setItem('carrito', JSON.stringify(this.carritoSubject.value));
  }

  // Cargar carrito desde localStorage (solo al inicializar si no está logueado)
  private cargarCarritoDesdeStorage(): void {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      try {
        const carrito = JSON.parse(carritoGuardado);
        this.carritoSubject.next(carrito);
      } catch (error) {
        console.error('Error al cargar carrito desde localStorage:', error);
        this.carritoSubject.next([]);
      }
    }
  }

  // ========== MÉTODOS HTTP BACKEND ==========

  private getHeaders(): HttpHeaders {
    const auth = localStorage.getItem('auth');
    return new HttpHeaders({
      'Authorization': auth ? `Basic ${auth}` : '',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    });
  }

  private obtenerCarrito(): Observable<CarritoResponse> {
    return this.http.get<CarritoResponse>(`${this.apiUrl}/api/carrito`, { 
      headers: this.getHeaders() 
    });
  }

  private agregarAlCarritoBackend(request: ItemCarritoRequest): Observable<CarritoResponse> {
    return this.http.post<CarritoResponse>(`${this.apiUrl}/api/carrito/agregar`, request, {
      headers: this.getHeaders()
    });
  }

  private actualizarCantidadBackend(productoId: number, cantidad: number): Observable<CarritoResponse> {
    return this.http.put<CarritoResponse>(
      `${this.apiUrl}/api/carrito/actualizar/${productoId}?cantidad=${cantidad}`,
      null,
      { headers: this.getHeaders() }
    );
  }

  private eliminarDelCarritoBackend(productoId: number): Observable<CarritoResponse> {
    return this.http.delete<CarritoResponse>(`${this.apiUrl}/api/carrito/eliminar/${productoId}`, {
      headers: this.getHeaders()
    });
  }

  private limpiarCarritoBackend(): Observable<CarritoResponse> {
    return this.http.delete<CarritoResponse>(`${this.apiUrl}/api/carrito/limpiar`, {
      headers: this.getHeaders()
    });
  }

  private sincronizarCarrito(items: ItemCarritoRequest[]): Observable<CarritoResponse> {
    return this.http.post<CarritoResponse>(`${this.apiUrl}/api/carrito/sincronizar`, items, {
      headers: this.getHeaders()
    });
  }
}
