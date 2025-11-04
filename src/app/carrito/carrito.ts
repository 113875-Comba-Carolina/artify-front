import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CarritoService, CarritoItem } from '../services/carrito.service';
import { AuthService } from '../auth/services/auth';
import { MercadoPagoService } from '../services/mercado-pago.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.scss'
})
export class CarritoComponent implements OnInit, OnDestroy {
  carritoItems: CarritoItem[] = [];
  totalCarrito = 0;
  isLoading = false;
  private carritoSubscription?: Subscription;

  constructor(
    private carritoService: CarritoService,
    private authService: AuthService,
    private router: Router,
    private mercadoPagoService: MercadoPagoService
  ) {}

  ngOnInit() {
    // Scroll hacia arriba cuando se carga el componente
    window.scrollTo(0, 0);
    
    // Verificar si el usuario está autenticado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Verificar si se regresó de una compra exitosa
    this.verificarCompraExitosa();

    // Suscribirse a los cambios del carrito (actualización reactiva)
    this.cargarCarrito();
  }

  ngOnDestroy() {
    // Limpiar la suscripción para evitar memory leaks
    if (this.carritoSubscription) {
      this.carritoSubscription.unsubscribe();
    }
  }

  cargarCarrito() {
    // Suscribirse al Observable del carrito para recibir actualizaciones automáticas
    this.carritoSubscription = this.carritoService.carrito$.subscribe({
      next: (items) => {
        this.carritoItems = items;
        this.calcularTotal();
      },
      error: (error) => {
        console.error('Error al cargar carrito:', error);
      }
    });
  }

  calcularTotal() {
    this.totalCarrito = this.carritoService.getTotalCarrito();
  }

  getCantidadTotal(): number {
    return this.carritoService.getCantidadTotal();
  }


  eliminarItem(productoId: number) {
    this.carritoService.eliminarDelCarrito(productoId);
    // No es necesario llamar a cargarCarrito() porque ya estamos suscritos al Observable
  }

  limpiarCarrito() {
    this.carritoService.limpiarCarrito();
    // No es necesario llamar a cargarCarrito() porque ya estamos suscritos al Observable
  }

  continuarComprando() {
    this.router.navigate(['/explorar-productos']);
  }

  verificarCompraExitosa() {
    // Verificar si viene de una página de pago exitoso
    const referrer = document.referrer;
    
    // Solo limpiar carrito si viene específicamente de pago-exitoso
    if (referrer && referrer.includes('/pago-exitoso')) {
      console.log('Regresando de página de pago exitoso, limpiando carrito...');
      this.carritoService.forzarLimpiezaCarrito();
      // No es necesario llamar a cargarCarrito() porque ya estamos suscritos al Observable
    }
  }


  async procederAlPago() {
    if (this.carritoItems.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    this.isLoading = true;

    try {
      // Verificar usuario actual
      const currentUser = this.authService.getCurrentUser();
      
      // Convertir items del carrito a formato de Mercado Pago
      const items = this.mercadoPagoService.convertirItemsCarrito(this.carritoItems);
      
      // Crear preferencia de pago
      // URL de ngrok para redirección de Mercado Pago (frontend)
      const ngrokUrl = 'https://treasurable-almeda-unsimply.ngrok-free.dev';
      
      const preferencia = await this.mercadoPagoService.crearPreferencia({
        items: items,
        externalReference: `ORDER-${Date.now()}`,
        notificationUrl: 'https://alberta-postsymphysial-buddy.ngrok-free.dev/api/payments/webhook',
        successUrl: `${ngrokUrl}/pago-exitoso`,
        failureUrl: `${ngrokUrl}/mis-ordenes?status=cancelled`,
        pendingUrl: `${ngrokUrl}/pago-pendiente`,
        autoReturn: true
      }).toPromise();

      if (preferencia && preferencia.success) {
        // Redirigir a Mercado Pago
        this.mercadoPagoService.redirigirAPago(preferencia.initPoint);
      } else {
        alert('Error al crear la preferencia de pago: ' + (preferencia?.message || 'Error desconocido'));
        this.isLoading = false;
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      alert('Error al procesar el pago. Por favor, intenta nuevamente.');
      this.isLoading = false;
    }
  }

  formatPrice(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  }

  getCategoriaIcon(categoria: string): string {
    const iconMap: { [key: string]: string } = {
      'CERAMICA': 'assets/icons/categoria-ceramica.png',
      'METALES': 'assets/icons/metales.png',
      'MATE': 'assets/icons/mate.png',
      'AROMAS_VELAS': 'assets/icons/aromas-velas.png',
      'TEXTILES': 'assets/icons/textiles.png',
      'CUERO': 'assets/icons/cuero.png',
      'MADERA': 'assets/icons/madera.png',
      'VIDRIO': 'assets/icons/vidrio.png',
      'JOYERIA_ARTESANAL': 'assets/icons/joyeria-artesanal.png',
      'CESTERIA_FIBRAS': 'assets/icons/cesteria-fibras.png',
      'ARTE_PINTURA': 'assets/icons/arte-pintura.png',
      'OTROS': 'assets/icons/otros.png'
    };
    return iconMap[categoria] || 'assets/icons/otros.png';
  }

  getCategoriaNombre(categoria: string): string {
    const categoriasMap: { [key: string]: string } = {
      'CERAMICA': 'Cerámica',
      'METALES': 'Metales',
      'MATE': 'Mates y accesorios',
      'AROMAS_VELAS': 'Aromas y velas',
      'TEXTILES': 'Textiles',
      'CUERO': 'Cuero',
      'MADERA': 'Madera',
      'VIDRIO': 'Vidrio',
      'JOYERIA_ARTESANAL': 'Joyería artesanal',
      'CESTERIA_FIBRAS': 'Cestería y fibras',
      'ARTE_PINTURA': 'Arte y pintura',
      'OTROS': 'Otros'
    };
    return categoriasMap[categoria] || categoria;
  }
}
