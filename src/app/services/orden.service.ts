import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ItemOrdenResponse {
  id: number;
  productoId: number;
  nombreProducto: string;
  imagenUrl: string;
  categoria: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  artesanoNombre?: string;
  artesanoEmail?: string;
  artesanoTelefono?: string;
}

export interface OrdenResponse {
  id: number;
  mercadoPagoId: string;
  externalReference: string;
  estado: string;
  total: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  nombreUsuario: string;
  emailUsuario: string;
  items: ItemOrdenResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class OrdenService {
  private baseUrl = `${environment.apiUrl}/api/ordenes`;
  private authHeaders: HttpHeaders;

  constructor(private http: HttpClient) {
    // Los headers se configurarán dinámicamente en cada llamada
    this.authHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true' // Saltar la página de advertencia de ngrok
    });
  }

  /**
   * Obtiene todas las órdenes del usuario actual
   */
  obtenerMisOrdenes(): Observable<OrdenResponse[]> {
    // Obtener credenciales del usuario autenticado
    const auth = localStorage.getItem('auth');
    if (!auth) {
      throw new Error('No hay credenciales de autenticación');
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    });
    
    return this.http.get<OrdenResponse[]>(this.baseUrl, {
      headers: headers
    });
  }

  /**
   * Obtiene una orden específica por ID
   */
  obtenerOrdenPorId(ordenId: number): Observable<OrdenResponse> {
    // Obtener credenciales del usuario autenticado
    const auth = localStorage.getItem('auth');
    if (!auth) {
      throw new Error('No hay credenciales de autenticación');
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    });
    
    return this.http.get<OrdenResponse>(`${this.baseUrl}/${ordenId}`, {
      headers: headers
    });
  }

  /**
   * Obtiene una orden por ID de Mercado Pago
   */
  obtenerOrdenPorMercadoPagoId(mercadoPagoId: string): Observable<OrdenResponse> {
    // Obtener credenciales del usuario autenticado
    const auth = localStorage.getItem('auth');
    if (!auth) {
      throw new Error('No hay credenciales de autenticación');
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    });
    
    return this.http.get<OrdenResponse>(`${this.baseUrl}/mercado-pago/${mercadoPagoId}`, {
      headers: headers
    });
  }
}
