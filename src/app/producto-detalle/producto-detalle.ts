import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService, Producto } from '../services/producto.service';
import { AuthService } from '../auth/services/auth';
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto-detalle.html',
  styleUrl: './producto-detalle.scss'
})
export class ProductoDetalleComponent implements OnInit {
  producto: Producto | null = null;
  isLoading = false;
  error = '';
  cantidad = 1;
  maxCantidad = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private authService: AuthService,
    private carritoService: CarritoService
  ) {}

  ngOnInit() {
    // Scroll hacia arriba cuando se carga el componente
    window.scrollTo(0, 0);
    
    this.loadProducto();
  }

  loadProducto() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID de producto no válido';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.productoService.obtenerProductoPorId(+id).subscribe({
      next: (producto) => {
        this.producto = producto;
        this.maxCantidad = producto.stock || 1;
        this.cantidad = Math.min(1, this.maxCantidad);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando producto:', error);
        this.error = 'Error al cargar el producto';
        this.isLoading = false;
      }
    });
  }

  onComprar() {
    if (!this.producto) return;
    console.log('Comprar producto:', this.producto.nombre, 'Cantidad:', this.cantidad);
    // TODO: Implementar funcionalidad de compra
  }

  onAgregarAlCarrito() {
    if (!this.producto) return;
    
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.carritoService.agregarAlCarrito(this.producto, this.cantidad);
    console.log('Producto agregado al carrito:', this.producto.nombre, 'Cantidad:', this.cantidad);
  }

  onCantidadChange() {
    if (this.cantidad < 1) this.cantidad = 1;
    if (this.cantidad > this.maxCantidad) this.cantidad = this.maxCantidad;
  }

  onIncrementarCantidad() {
    if (this.cantidad < this.maxCantidad) {
      this.cantidad++;
    }
  }

  onDecrementarCantidad() {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  goBack() {
    this.router.navigate(['/']);
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
