import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrdenService, OrdenResponse } from '../services/orden.service';
import { AuthService } from '../auth/services/auth';
import { MercadoPagoService, MercadoPagoItem } from '../services/mercado-pago.service';
import { AlertService } from '../services/alert.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-mis-ordenes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-ordenes.html',
  styleUrl: './mis-ordenes.scss'
})
export class MisOrdenesComponent implements OnInit {
  ordenes: OrdenResponse[] = [];
  isLoading = false;
  error: string | null = null;
  showPaymentCancelledMessage = false;

  constructor(
    private ordenService: OrdenService,
    private router: Router,
    private authService: AuthService,
    private mercadoPagoService: MercadoPagoService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    // Verificar si el usuario está autenticado
    if (!this.authService.isLoggedIn()) {
      console.log('Usuario no autenticado, redirigiendo al login...');
      // Redirigir al login y guardar la URL de destino
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: '/mis-ordenes' } 
      });
      return;
    }
    
    // Verificar si el usuario regresó de MercadoPago sin completar el pago
    this.checkPaymentReturn();
    
    console.log('Usuario autenticado, cargando órdenes...');
    this.cargarOrdenes();
  }

  checkPaymentReturn() {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const paymentStatus = urlParams.get('payment_status');
    
    console.log('URL actual:', window.location.href);
    console.log('Parámetros de URL:', Object.fromEntries(urlParams.entries()));
    console.log('Status:', status);
    console.log('Payment Status:', paymentStatus);
    
    // Detectar diferentes tipos de cancelación
    if (status === 'cancelled' || 
        status === 'rejected' || 
        paymentStatus === 'cancelled' || 
        paymentStatus === 'rejected' ||
        window.location.href.includes('status=cancelled')) {
      console.log('Detectada cancelación de pago');
      this.showPaymentCancelledMessage = true;
      // Limpiar los parámetros de la URL
      this.router.navigate(['/mis-ordenes'], { replaceUrl: true });
    }
  }

  async cargarOrdenes() {
    this.isLoading = true;
    this.error = null;

    try {
      this.ordenes = await this.ordenService.obtenerMisOrdenes().toPromise() || [];
    } catch (error) {
      console.error('Error cargando órdenes:', error);
      this.error = 'Error al cargar tus órdenes. Por favor, intenta nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }



  getEstadoColor(estado: string): string {
    const colores: { [key: string]: string } = {
      'PENDIENTE': 'orange',
      'PAGADO': 'green',
      'ENVIADO': 'blue',
      'ENTREGADO': 'green',
      'CANCELADO': 'red',
      'REEMBOLSADO': 'gray'
    };
    return colores[estado] || 'gray';
  }

  getEstadoTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      'PENDIENTE': 'Pendiente de pago',
      'PAGADO': 'Pagado',
      'ENVIADO': 'Enviado',
      'ENTREGADO': 'Entregado',
      'CANCELADO': 'Cancelado',
      'REEMBOLSADO': 'Reembolsado'
    };
    return textos[estado] || estado;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  verDetalleProducto(productoId: number): void {
    this.router.navigate(['/producto', productoId]);
  }

  irAExplorarProductos(): void {
    this.router.navigate(['/explorar-productos']);
  }

  cerrarMensajePagoCancelado(): void {
    this.showPaymentCancelledMessage = false;
  }

  verComprobante(orden: OrdenResponse): void {
    // Construir la URL del comprobante con los parámetros de la orden
    const baseUrl = 'https://treasurable-almeda-unsimply.ngrok-free.dev/comprobante';
    const params = new URLSearchParams({
      external_reference: orden.externalReference,
      payment_id: orden.mercadoPagoId
    });
    
    const url = `${baseUrl}?${params.toString()}`;
    window.open(url, '_blank');
  }

  procederAlPago(orden: OrdenResponse): void {
    if (!this.authService.isLoggedIn()) {
      this.alertService.warning('Sesión requerida', 'Debes iniciar sesión para proceder al pago');
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: '/mis-ordenes' } 
      });
      return;
    }

    try {
      // Convertir los items de la orden al formato esperado por el backend
      const items = orden.items.map(item => {
        const convertedItem = {
          title: item.nombreProducto,
          description: `Producto artesanal - ${item.categoria}`,
          quantity: item.cantidad,
          unitPrice: item.precioUnitario,
          pictureUrl: item.imagenUrl || undefined, // Asegurar que sea undefined si es null
          categoryId: this.mercadoPagoService.mapearCategoria(item.categoria)
        };
        
        console.log('Item convertido:', convertedItem);
        return convertedItem;
      });

      // Usar el externalReference original de la orden para actualizar el estado existente
      const preferenceRequest = {
        items: items,
        externalReference: orden.externalReference,
        notificationUrl: `${environment.apiUrl}/api/payments/webhook`,
        successUrl: `${environment.frontendUrl}/pago-exitoso`,
        failureUrl: `${environment.frontendUrl}/mis-ordenes?status=cancelled`, // Agregar parámetro para detectar cancelación
        pendingUrl: `${environment.frontendUrl}/pago-pendiente`,
        autoReturn: false // NO usar autoReturn para mantener el botón "Volver a la tienda"
      };

      console.log('ExternalReference de la orden:', orden.externalReference);
      console.log('Items de la orden:', orden.items);
      console.log('Items convertidos:', items);
      console.log('Datos de la preferencia:', preferenceRequest);
      
      this.mercadoPagoService.crearPreferencia(preferenceRequest).subscribe({
        next: (response) => {
          console.log('Respuesta de MercadoPago:', response);
          if (response.success) {
            // Redirigir a MercadoPago
            this.mercadoPagoService.redirigirAPago(response.initPoint);
          } else {
            this.alertService.error('Error al crear el pago', response.message || 'No se pudo procesar el pago');
          }
        },
        error: (error) => {
          console.error('Error completo:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error body:', error.error);
          this.alertService.error('Error al procesar el pago', `Error ${error.status}: ${error.error?.message || error.message || 'No se pudo conectar con el sistema de pagos'}`);
        }
      });
    } catch (error) {
      console.error('Error en procederAlPago:', error);
      this.alertService.error('Error', 'No se pudo procesar el pago');
    }
  }
}
