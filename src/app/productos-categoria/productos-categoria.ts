import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService, Producto } from '../services/producto.service';
import { AuthService } from '../auth/services/auth';
import { CarritoService } from '../services/carrito.service';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-productos-categoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos-categoria.html',
  styleUrl: './productos-categoria.scss'
})
export class ProductosCategoriaComponent implements OnInit {
  productos: Producto[] = [];
  categoria: string = '';
  categoriaNombre: string = '';
  isLoading = false;
  error = '';
  searchTerm = '';
  productosFiltrados: Producto[] = [];

  // Mapeo de categorías
  categoriasMap: { [key: string]: string } = {
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private authService: AuthService,
    private carritoService: CarritoService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    // Scroll hacia arriba cuando se carga el componente
    window.scrollTo(0, 0);
    
    // Verificar si el usuario está autenticado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/register'], { 
        queryParams: { 
          redirect: `/categoria/${this.route.snapshot.params['categoria']}` 
        } 
      });
      return;
    }

    this.route.params.subscribe(params => {
      this.categoria = params['categoria'];
      this.categoriaNombre = this.categoriasMap[this.categoria] || this.categoria;
      this.loadProductos();
    });
  }

  loadProductos() {
    this.isLoading = true;
    this.error = '';
    
    this.productoService.obtenerProductosPorCategoria(this.categoria, 0, 100).subscribe({
      next: (response) => {
        this.productos = response.content || [];
        this.productosFiltrados = [...this.productos];
        this.isLoading = false;
        // Scroll suave hacia arriba después de cargar los productos
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
        this.error = 'Error al cargar los productos de esta categoría';
        this.isLoading = false;
      }
    });
  }

  onSearchChange() {
    if (!this.searchTerm.trim()) {
      this.productosFiltrados = [...this.productos];
    } else {
      this.productosFiltrados = this.productos.filter(producto =>
        producto.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        producto.artesano?.nombre?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        producto.artesano?.nombreEmprendimiento?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.productosFiltrados = [...this.productos];
  }

  goBack() {
    this.router.navigate(['/']).then(() => {
      // Scroll hacia arriba después de navegar al home
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    });
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

  formatPrice(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  }

  onAgregarAlCarrito(event: Event, producto: Producto) {
    event.stopPropagation(); // Evitar que se active el click de la card
    
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

  onVerDetalles(producto: Producto) {
    this.router.navigate(['/producto', producto.id]);
  }
}
