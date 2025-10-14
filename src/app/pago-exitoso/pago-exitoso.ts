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
    this.carritoService.forzarLimpiezaCarrito();
    
    // Marcar la compra como exitosa en localStorage para detección posterior
    localStorage.setItem('ultima_compra_exitosa', Date.now().toString());
    console.log('Compra exitosa marcada en localStorage');

    // Scroll hacia arriba
    window.scrollTo(0, 0);

    // Redirigir automáticamente a mis-ordenes después de 3 segundos
    setTimeout(() => {
      this.router.navigate(['/mis-ordenes']);
    }, 3000);
  }

  volverAlInicio() {
    this.router.navigate(['/']);
  }

  volverATienda() {
    this.router.navigate(['/explorar-productos']);
  }
}
