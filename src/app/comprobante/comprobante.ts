import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdenService, OrdenResponse } from '../services/orden.service';

@Component({
  selector: 'app-comprobante',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comprobante.html',
  styleUrl: './comprobante.scss'
})
export class ComprobanteComponent implements OnInit {
  orden: OrdenResponse | null = null;
  isLoading = true;
  error: string | null = null;
  fechaPago: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ordenService: OrdenService
  ) {}

  ngOnInit() {
    // Obtener parámetros de la URL
    const externalReference = this.route.snapshot.queryParams['external_reference'];
    const paymentId = this.route.snapshot.queryParams['payment_id'];
    
    if (externalReference) {
      this.cargarOrdenPorReferencia(externalReference);
    } else if (paymentId) {
      this.cargarOrdenPorMercadoPagoId(paymentId);
    } else {
      this.error = 'No se encontraron parámetros válidos para mostrar el comprobante';
      this.isLoading = false;
    }
  }

  async cargarOrdenPorReferencia(externalReference: string) {
    try {
      // Buscar la orden por external_reference
      const ordenes = await this.ordenService.obtenerMisOrdenes().toPromise() || [];
      this.orden = ordenes.find(orden => orden.externalReference === externalReference) || null;
      
      if (this.orden) {
        this.fechaPago = new Date(this.orden.fechaCreacion).toLocaleString('es-AR');
      } else {
        this.error = 'No se encontró la orden solicitada';
      }
    } catch (error) {
      console.error('Error cargando orden:', error);
      this.error = 'Error al cargar el comprobante';
    } finally {
      this.isLoading = false;
    }
  }

  async cargarOrdenPorMercadoPagoId(paymentId: string) {
    try {
      this.orden = await this.ordenService.obtenerOrdenPorMercadoPagoId(paymentId).toPromise() || null;
      
      if (this.orden) {
        this.fechaPago = new Date(this.orden.fechaCreacion).toLocaleString('es-AR');
      } else {
        this.error = 'No se encontró la orden solicitada';
      }
    } catch (error) {
      console.error('Error cargando orden:', error);
      this.error = 'Error al cargar el comprobante';
    } finally {
      this.isLoading = false;
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  }

  volverAMisOrdenes() {
    this.router.navigate(['/mis-ordenes']);
  }
}
