import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MercadoPagoService } from '../services/mercado-pago.service';
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-pago-exitoso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pago-exitoso.html',
  styleUrl: './pago-exitoso.scss'
})
export class PagoExitosoComponent implements OnInit {
  paymentId: string | null = null;
  externalReference: string | null = null;
  fechaPago: string = '';

  constructor(
    private mercadoPagoService: MercadoPagoService,
    private carritoService: CarritoService,
    private router: Router
  ) {}

  ngOnInit() {
    // Obtener parámetros de la URL
    const resultado = this.mercadoPagoService.procesarResultadoPago();
    this.paymentId = resultado.paymentId;
    this.externalReference = resultado.externalReference;
    this.fechaPago = new Date().toLocaleString('es-AR');

    // Limpiar el carrito ya que el pago fue exitoso
    this.carritoService.limpiarCarrito();

    // Scroll hacia arriba
    window.scrollTo(0, 0);
  }

  volverAlInicio() {
    this.router.navigate(['/']);
  }

  verProductos() {
    this.router.navigate(['/explorar-productos']);
  }
}
