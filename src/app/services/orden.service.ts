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
    const credentials = btoa(`${environment.basicAuth.username}:${environment.basicAuth.password}`);
    this.authHeaders = new HttpHeaders({
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Obtiene todas las órdenes del usuario actual
   */
  obtenerMisOrdenes(): Observable<OrdenResponse[]> {
    return this.http.get<OrdenResponse[]>(this.baseUrl, {
      headers: this.authHeaders
    });
  }

  /**
   * Obtiene una orden específica por ID
   */
  obtenerOrdenPorId(ordenId: number): Observable<OrdenResponse> {
    return this.http.get<OrdenResponse>(`${this.baseUrl}/${ordenId}`, {
      headers: this.authHeaders
    });
  }

  /**
   * Obtiene una orden por ID de Mercado Pago
   */
  obtenerOrdenPorMercadoPagoId(mercadoPagoId: string): Observable<OrdenResponse> {
    return this.http.get<OrdenResponse>(`${this.baseUrl}/mercado-pago/${mercadoPagoId}`, {
      headers: this.authHeaders
    });
  }
}
