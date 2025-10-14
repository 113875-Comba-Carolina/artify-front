import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MercadoPagoItem {
  title: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  pictureUrl?: string;
  categoryId?: string;
}

export interface CreatePreferenceRequest {
  items: MercadoPagoItem[];
  externalReference?: string;
  notificationUrl?: string;
  successUrl?: string;
  failureUrl?: string;
  pendingUrl?: string;
  autoReturn?: boolean;
}

export interface PreferenceResponse {
  id: string;
  initPoint: string;
  sandboxInitPoint: string;
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {
  private baseUrl = `${environment.apiUrl}/api/payments`;
  private authHeaders: HttpHeaders;

  constructor(private http: HttpClient) {
    // Los headers se configurarán dinámicamente en cada llamada
    this.authHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true' // Saltar la página de advertencia de ngrok
    });
  }

  /**
   * Crea una preferencia de pago en Mercado Pago
   */
  crearPreferencia(request: CreatePreferenceRequest): Observable<PreferenceResponse> {
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
    
    return this.http.post<PreferenceResponse>(`${this.baseUrl}/preference`, request, {
      headers: headers
    });
  }

  /**
   * Obtiene la clave pública de Mercado Pago
   */
  obtenerClavePublica(): Observable<string> {
    // Obtener credenciales del usuario autenticado
    const auth = localStorage.getItem('auth');
    if (!auth) {
      throw new Error('No hay credenciales de autenticación');
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Basic ${auth}`,
      'ngrok-skip-browser-warning': 'true'
    });
    
    return this.http.get<string>(`${this.baseUrl}/public-key`, {
      headers: headers
    });
  }

  /**
   * Redirige al usuario a Mercado Pago para completar el pago
   */
  redirigirAPago(initPoint: string): void {
    window.location.href = initPoint;
  }

  /**
   * Procesa el resultado de un pago desde los parámetros de la URL
   */
  procesarResultadoPago(): { paymentId: string | null; status: string | null; externalReference: string | null } {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      paymentId: urlParams.get('payment_id'),
      status: urlParams.get('status'),
      externalReference: urlParams.get('external_reference')
    };
  }

  /**
   * Convierte items del carrito a formato de Mercado Pago
   */
  convertirItemsCarrito(carritoItems: any[]): MercadoPagoItem[] {
    return carritoItems.map(item => ({
      title: item.producto.nombre,
      description: `Producto artesanal - ${item.producto.categoria}`,
      quantity: item.cantidad,
      unitPrice: item.producto.precio,
      pictureUrl: item.producto.imagenUrl,
      categoryId: this.mapearCategoria(item.producto.categoria)
    }));
  }

  /**
   * Mapea las categorías del marketplace a categorías de Mercado Pago
   */
  mapearCategoria(categoria: string): string {
    const categoriaMap: { [key: string]: string } = {
      'CERAMICA': 'artesanias',
      'METALES': 'artesanias',
      'MATE': 'artesanias',
      'AROMAS_VELAS': 'artesanias',
      'TEXTILES': 'artesanias',
      'CUERO': 'artesanias',
      'MADERA': 'artesanias',
      'VIDRIO': 'artesanias',
      'JOYERIA_ARTESANAL': 'artesanias',
      'CESTERIA_FIBRAS': 'artesanias',
      'ARTE_PINTURA': 'artesanias',
      'OTROS': 'artesanias'
    };
    return categoriaMap[categoria] || 'artesanias';
  }
}
