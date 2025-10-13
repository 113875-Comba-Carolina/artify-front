import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private carritoSubject = new BehaviorSubject<CarritoItem[]>([]);
  public carrito$ = this.carritoSubject.asObservable();

  constructor() {
    // Cargar carrito desde localStorage al inicializar
    this.cargarCarritoDesdeStorage();
  }

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
    const carritoActual = this.carritoSubject.value;
    const itemExistente = carritoActual.find(item => item.producto.id === producto.id);

    if (itemExistente) {
      // Si ya existe, actualizar cantidad
      itemExistente.cantidad += cantidad;
      itemExistente.subtotal = itemExistente.producto.precio * itemExistente.cantidad;
    } else {
      // Si no existe, agregar nuevo item
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
    const carritoActual = this.carritoSubject.value;
    const carritoFiltrado = carritoActual.filter(item => item.producto.id !== productoId);
    this.carritoSubject.next(carritoFiltrado);
    this.guardarCarritoEnStorage();
  }

  // Limpiar carrito
  limpiarCarrito(): void {
    console.log('Limpiando carrito...');
    this.carritoSubject.next([]);
    this.guardarCarritoEnStorage();
    console.log('Carrito limpiado exitosamente');
  }

  // Forzar limpieza del carrito (para casos de compra exitosa)
  forzarLimpiezaCarrito(): void {
    console.log('Forzando limpieza del carrito...');
    this.carritoSubject.next([]);
    localStorage.removeItem('carrito');
    console.log('Carrito forzadamente limpiado');
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

  // Guardar carrito en localStorage
  private guardarCarritoEnStorage(): void {
    localStorage.setItem('carrito', JSON.stringify(this.carritoSubject.value));
  }

  // Cargar carrito desde localStorage
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
}
