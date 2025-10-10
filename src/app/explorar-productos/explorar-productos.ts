import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductoService, Producto } from '../services/producto.service';
import { AuthService } from '../auth/services/auth';
import { CarritoService } from '../services/carrito.service';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-explorar-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './explorar-productos.html',
  styleUrls: ['./explorar-productos.scss']
})
export class ExplorarProductosComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categorias: string[] = [];
  categoriaSeleccionada: string = '';
  terminoBusqueda: string = '';
  isLoading = false;
  page = 0;
  size = 20;
  hasMore = true;

  // Mapeo de categorías para mostrar nombres amigables
  categoriaNombres: { [key: string]: string } = {
    'CERAMICA': 'Cerámica',
    'METALES': 'Metales',
    'MATE': 'Mate',
    'AROMAS_VELAS': 'Aromas y Velas',
    'TEXTILES': 'Textiles',
    'MADERA': 'Madera',
    'CUERO': 'Cuero',
    'JOYERIA_ARTESANAL': 'Joyería Artesanal',
    'VIDRIO': 'Vidrio',
    'RECICLABLES': 'Reciclables',
    'CESTERIA_FIBRAS': 'Cestería y Fibras',
    'ARTE_PINTURA': 'Arte y Pintura',
    'OTROS': 'Otros'
  };

  constructor(
    private productoService: ProductoService,
    private authService: AuthService,
    private carritoService: CarritoService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategorias();
    this.loadProductos();
  }

  loadCategorias() {
    this.categorias = Object.keys(this.categoriaNombres);
  }

  loadProductos() {
    this.isLoading = true;
    this.page = 0;
    this.hasMore = true;

    this.productoService.obtenerProductos(this.page, this.size).subscribe({
      next: (response) => {
        this.productos = response.content || response as any;
        this.productosFiltrados = [...this.productos];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
        this.isLoading = false;
      }
    });
  }

  onBuscar() {
    this.filtrarProductos();
  }

  onCategoriaChange() {
    this.filtrarProductos();
  }

  filtrarProductos() {
    let productosFiltrados = [...this.productos];

    // Filtrar por término de búsqueda
    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase().trim();
      productosFiltrados = productosFiltrados.filter(producto =>
        producto.nombre.toLowerCase().includes(termino) ||
        producto.descripcion.toLowerCase().includes(termino) ||
        (producto.artesano?.nombre && producto.artesano.nombre.toLowerCase().includes(termino))
      );
    }

    // Filtrar por categoría
    if (this.categoriaSeleccionada) {
      productosFiltrados = productosFiltrados.filter(producto =>
        producto.categoria === this.categoriaSeleccionada
      );
    }

    this.productosFiltrados = productosFiltrados;
  }

  limpiarFiltros() {
    this.terminoBusqueda = '';
    this.categoriaSeleccionada = '';
    this.productosFiltrados = [...this.productos];
  }

  onAgregarAlCarrito(event: Event, producto: Producto) {
    event.stopPropagation();
    
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Verificar si el producto está disponible para compra
    if (!this.canPurchase(producto)) {
      this.alertService.warning('Producto no disponible', 'Este producto no está disponible para compra (sin stock o inactivo)');
      return;
    }

    this.carritoService.agregarAlCarrito(producto, 1);
    this.alertService.success('Agregado al carrito', `${producto.nombre} ha sido agregado al carrito`);
    console.log('Producto agregado al carrito:', producto.nombre);
  }

  verDetallesProducto(producto: Producto) {
    this.router.navigate(['/producto', producto.id]);
  }

  canPurchase(producto: Producto): boolean {
    // Si hay un campo disponibleParaCompra explícito, usarlo
    if (producto.disponibleParaCompra !== undefined) {
      return producto.disponibleParaCompra;
    }
    
    // Fallback: verificar esActivo y stock
    const esActivo = producto.esActivo ?? true; // Por defecto activo si no se especifica
    const stock = producto.stock ?? 0;
    
    return esActivo && stock > 0;
  }

  getCategoriaNombre(categoria: string): string {
    return this.categoriaNombres[categoria] || categoria;
  }

  getEstadoProducto(producto: Producto): string {
    if (producto.estado) {
      switch (producto.estado) {
        case 'ACTIVO': return 'Activo';
        case 'INACTIVO': return 'Inactivo';
        case 'SIN_STOCK': return 'Sin Stock';
        default: return 'Desconocido';
      }
    }
    // Fallback for compatibility
    if (!producto.esActivo) return 'Inactivo';
    if (producto.stock === 0) return 'Sin Stock';
    return 'Activo';
  }

  getEstadoClass(producto: Producto): string {
    if (producto.estado) {
      switch (producto.estado) {
        case 'ACTIVO': return 'status-active';
        case 'INACTIVO': return 'status-inactive';
        case 'SIN_STOCK': return 'status-no-stock';
        default: return 'status-unknown';
      }
    }
    // Fallback for compatibility
    if (!producto.esActivo) return 'status-inactive';
    if (producto.stock === 0) return 'status-no-stock';
    return 'status-active';
  }

  formatPrice(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
