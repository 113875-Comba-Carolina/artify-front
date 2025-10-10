import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CarritoService, CarritoItem } from '../services/carrito.service';
import { AuthService } from '../auth/services/auth';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.scss'
})
export class CarritoComponent implements OnInit {
  carritoItems: CarritoItem[] = [];
  totalCarrito = 0;
  isLoading = false;

  constructor(
    private carritoService: CarritoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Scroll hacia arriba cuando se carga el componente
    window.scrollTo(0, 0);
    
    // Verificar si el usuario está autenticado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.cargarCarrito();
  }

  cargarCarrito() {
    this.carritoItems = this.carritoService.getCarrito();
    this.calcularTotal();
  }

  calcularTotal() {
    this.totalCarrito = this.carritoService.getTotalCarrito();
  }

  getCantidadTotal(): number {
    return this.carritoService.getCantidadTotal();
  }

  actualizarCantidad(productoId: number, nuevaCantidad: number) {
    if (nuevaCantidad < 1) {
      this.eliminarItem(productoId);
    } else {
      this.carritoService.actualizarCantidad(productoId, nuevaCantidad);
      this.cargarCarrito();
    }
  }

  eliminarItem(productoId: number) {
    this.carritoService.eliminarDelCarrito(productoId);
    this.cargarCarrito();
  }

  limpiarCarrito() {
    this.carritoService.limpiarCarrito();
    this.cargarCarrito();
  }

  continuarComprando() {
    this.router.navigate(['/']);
  }

  procederAlPago() {
    console.log('Proceder al pago:', this.carritoItems);
    // TODO: Implementar funcionalidad de pago
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
