import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrdenService, OrdenResponse } from '../services/orden.service';
import { AuthService } from '../auth/services/auth';
import { MercadoPagoService, MercadoPagoItem } from '../services/mercado-pago.service';
import { AlertService } from '../services/alert.service';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface BuyerStatistics {
  totalOrdenes: number;
  totalGastado: number;
  totalProductos: number;
  promedioPorCompra: number;
  categoriasFavoritas: CategoriaFavorita[];
  productosMasComprados: ProductoMasComprado[];
  artesanosFavoritos: ArtesanoFavorito[];
}

interface CategoriaFavorita {
  categoria: string;
  cantidadComprada: number;
  totalGastado: number;
}

interface ProductoMasComprado {
  nombre: string;
  imagenUrl: string;
  totalComprado: number;
  totalGastado: number;
}

interface ArtesanoFavorito {
  nombre: string;
  ordenesConArtesano: number;
  totalGastado: number;
}

@Component({
  selector: 'app-mis-ordenes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-ordenes.html',
  styleUrl: './mis-ordenes.scss'
})
export class MisOrdenesComponent implements OnInit {
  ordenes: OrdenResponse[] = [];
  estadisticas: BuyerStatistics | null = null;
  isLoading = false;
  isLoadingStats = false;
  error: string | null = null;
  showPaymentCancelledMessage = false;

  constructor(
    private ordenService: OrdenService,
    private router: Router,
    private authService: AuthService,
    private mercadoPagoService: MercadoPagoService,
    private alertService: AlertService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Verificar si el usuario está autenticado
    if (!this.authService.isLoggedIn()) {
      // Redirigir al login y guardar la URL de destino
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: '/mis-ordenes' } 
      });
      return;
    }
    
    // Verificar si el usuario regresó de MercadoPago sin completar el pago
    this.checkPaymentReturn();
    
    this.cargarOrdenes();
    this.cargarEstadisticas();
  }

  checkPaymentReturn() {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const paymentStatus = urlParams.get('payment_status');
    
    // Detectar diferentes tipos de cancelación
    if (status === 'cancelled' || 
        status === 'rejected' || 
        paymentStatus === 'cancelled' || 
        paymentStatus === 'rejected' ||
        window.location.href.includes('status=cancelled')) {
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

  async cargarEstadisticas() {
    this.isLoadingStats = true;

    try {
      const auth = localStorage.getItem('auth');
      if (!auth) {
        this.isLoadingStats = false;
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      });

      this.estadisticas = await this.http.get<BuyerStatistics>(
        `${environment.apiUrl}/api/ordenes/estadisticas`,
        { headers }
      ).toPromise() || null;
    } catch (error) {
      // Error silencioso - las estadísticas son opcionales
    } finally {
      this.isLoadingStats = false;
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

  contactarArtesano(item: OrdenResponse['items'][0]): void {
    if (!item.artesanoTelefono) {
      this.alertService.warning('Sin teléfono', 'El artesano no tiene número de teléfono registrado');
      return;
    }

    const nombreArtesano = item.artesanoNombre || 'Artesano';
    const nombreProducto = item.nombreProducto || 'producto';
    const mensaje = `Hola ${nombreArtesano}, he realizado una compra de ${nombreProducto}. Me gustaría coordinar contigo la forma de entrega para este producto. ¿Cuál sería el método más conveniente para ti?`;
    
    this.abrirWhatsApp(item.artesanoTelefono, mensaje);
  }

  private abrirWhatsApp(telefono: string, mensaje: string): void {
    // Limpiar el número de teléfono (quitar espacios, guiones, etc.)
    const numeroLimpio = telefono.replace(/[\s\-\(\)]/g, '');
    // Codificar el mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);
    // Construir la URL de WhatsApp
    const whatsappUrl = `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`;
    // Abrir WhatsApp en una nueva ventana/pestaña
    window.open(whatsappUrl, '_blank');
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
      const items = orden.items.map(item => ({
        title: item.nombreProducto,
        description: `Producto artesanal - ${item.categoria}`,
        quantity: item.cantidad,
        unitPrice: item.precioUnitario,
        pictureUrl: item.imagenUrl || undefined,
        categoryId: this.mercadoPagoService.mapearCategoria(item.categoria)
      }));

      // Usar el externalReference original de la orden para actualizar el estado existente
      const preferenceRequest = {
        items: items,
        externalReference: orden.externalReference,
        notificationUrl: `${environment.apiUrl}/api/payments/webhook`,
        successUrl: `${environment.frontendUrl}/pago-exitoso`,
        failureUrl: `${environment.frontendUrl}/mis-ordenes?status=cancelled`,
        pendingUrl: `${environment.frontendUrl}/pago-pendiente`,
        autoReturn: false
      };
      
      this.mercadoPagoService.crearPreferencia(preferenceRequest).subscribe({
        next: (response) => {
          if (response.success) {
            // Redirigir a MercadoPago
            this.mercadoPagoService.redirigirAPago(response.initPoint);
          } else {
            this.alertService.error('Error al crear el pago', response.message || 'No se pudo procesar el pago');
          }
        },
        error: (error) => {
          console.error('Error al procesar el pago:', error);
          this.alertService.error('Error al procesar el pago', `Error ${error.status}: ${error.error?.message || error.message || 'No se pudo conectar con el sistema de pagos'}`);
        }
      });
    } catch (error) {
      console.error('Error en procederAlPago:', error);
      this.alertService.error('Error', 'No se pudo procesar el pago');
    }
  }

  formatearCategoria(categoria: string): string {
    const categorias: { [key: string]: string } = {
      'CERAMICA': 'Cerámica',
      'MADERA': 'Madera',
      'TEXTILES': 'Textiles',
      'CUERO': 'Cuero',
      'JOYERIA_ARTESANAL': 'Joyería Artesanal',
      'AROMAS_VELAS': 'Aromas y Velas',
      'VIDRIO': 'Vidrio',
      'METALES': 'Metales',
      'CESTERIA_FIBRAS': 'Cestería y Fibras',
      'MATE': 'Mate'
    };
    return categorias[categoria] || categoria;
  }
}
