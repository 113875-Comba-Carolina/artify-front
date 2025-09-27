import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Producto {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  stock: number;
  imagenUrl?: string;
  esActivo?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  artesano?: {
    id: number;
    nombre: string;
    email: string;
    nombreEmprendimiento: string;
    descripcion: string;
    ubicacion: string;
  };
  // Mantener compatibilidad con versiones anteriores
  artesanoNombre?: string;
  artesanoId?: number;
}

export interface ProductoRequest {
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  stock: number;
  imagenUrl?: string;
}

export interface ProductoResponse {
  content: Producto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface Estadisticas {
  totalProductos: number;
  productosActivos: number;
  productosInactivos: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Obtener todos los productos (público)
  obtenerProductos(page: number = 0, size: number = 10): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.apiUrl}/productos?page=${page}&size=${size}`);
  }

  // Obtener producto por ID (público)
  obtenerProductoPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/productos/${id}`);
  }

  // Buscar productos por nombre (público)
  buscarProductos(nombre: string, page: number = 0, size: number = 10): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.apiUrl}/productos/buscar?nombre=${nombre}&page=${page}&size=${size}`);
  }

  // Obtener productos por categoría (público)
  obtenerProductosPorCategoria(categoria: string, page: number = 0, size: number = 10): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.apiUrl}/productos/categoria/${categoria}?page=${page}&size=${size}`);
  }


  // Crear producto (requiere autenticación)
  crearProducto(producto: ProductoRequest): Observable<Producto> {
    const headers = this.getAuthHeaders();
    return this.http.post<Producto>(`${this.apiUrl}/productos`, producto, { headers });
  }

  // Actualizar producto (requiere autenticación)
  actualizarProducto(id: number, producto: ProductoRequest): Observable<Producto> {
    const headers = this.getAuthHeaders();
    return this.http.put<Producto>(`${this.apiUrl}/productos/${id}`, producto, { headers });
  }

  // Eliminar producto (requiere autenticación)
  eliminarProducto(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/productos/${id}`, { headers });
  }

  // Obtener productos del artesano autenticado
  obtenerMisProductos(page: number = 0, size: number = 10): Observable<ProductoResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<ProductoResponse>(`${this.apiUrl}/productos/mis-productos?page=${page}&size=${size}`, { headers });
  }

  // Obtener estadísticas del artesano
  obtenerMisEstadisticas(): Observable<Estadisticas> {
    const headers = this.getAuthHeaders();
    return this.http.get<Estadisticas>(`${this.apiUrl}/productos/mis-estadisticas`, { headers });
  }

  // Método privado para obtener headers de autenticación
  private getAuthHeaders(): HttpHeaders {
    const auth = localStorage.getItem('auth');
    if (!auth) {
      throw new Error('No hay credenciales de autenticación');
    }
    return new HttpHeaders({
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    });
  }
}
