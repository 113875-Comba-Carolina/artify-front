import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MercadoPagoService } from '../services/mercado-pago.service';

@Component({
  selector: 'app-pago-fallido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pago-fallido.html',
  styleUrl: './pago-fallido.scss'
})
export class PagoFallidoComponent implements OnInit {
  paymentId: string | null = null;
  externalReference: string | null = null;
  fechaPago: string = '';

  constructor(
    private mercadoPagoService: MercadoPagoService,
    private router: Router
  ) {}

  ngOnInit() {
    // Obtener parámetros de la URL
    const resultado = this.mercadoPagoService.procesarResultadoPago();
    this.paymentId = resultado.paymentId;
    this.externalReference = resultado.externalReference;
    this.fechaPago = new Date().toLocaleString('es-AR');

    // Scroll hacia arriba
    window.scrollTo(0, 0);
  }

  volverAlInicio() {
    this.router.navigate(['/']);
  }

  intentarNuevamente() {
    this.router.navigate(['/carrito']);
  }

  verProductos() {
    this.router.navigate(['/carrito']);
  }
}
