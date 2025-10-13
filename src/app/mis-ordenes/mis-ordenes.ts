import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrdenService, OrdenResponse } from '../services/orden.service';
import { AuthService } from '../auth/services/auth';

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

  constructor(
    private ordenService: OrdenService,
    private router: Router,
    private authService: AuthService
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
    
    console.log('Usuario autenticado, cargando órdenes...');
    this.cargarOrdenes();
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
}
