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
  productosPaginados: Producto[] = [];
  categorias: string[] = [];
  categoriaSeleccionada: string = '';
  terminoBusqueda: string = '';
  isLoading = false;
  page = 0;
  size = 15;
  hasMore = true;
  totalPages = 0;
  totalElements = 0;
  hasActiveFilters = false;
  
  // Hacer Math disponible en el template
  Math = Math;

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

  loadProductos(page: number = 0) {
    this.isLoading = true;
    this.page = page;

    // Si es la primera carga, obtener todos los productos del backend
    if (this.productos.length === 0) {
      this.productoService.obtenerTodosLosProductos().subscribe({
        next: (productos) => {
          console.log('Productos obtenidos del backend:', productos.length);
          this.productos = productos;
          this.aplicarFiltrosYActualizarPaginacion();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando productos:', error);
          this.isLoading = false;
        }
      });
    } else {
      // Si ya tenemos productos, solo aplicar filtros y paginación
      this.aplicarFiltrosYActualizarPaginacion();
      this.isLoading = false;
    }
  }

  aplicarFiltrosYActualizarPaginacion() {
    // Aplicar filtros
    this.productosFiltrados = this.productos.filter(producto => {
      const coincideNombre = !this.terminoBusqueda.trim() || 
        producto.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
        (producto.artesano && producto.artesano.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase()));
      
      const coincideCategoria = !this.categoriaSeleccionada || 
        producto.categoria === this.categoriaSeleccionada;
      
      return coincideNombre && coincideCategoria;
    });

    // Actualizar totales
    this.totalElements = this.productosFiltrados.length;
    this.totalPages = Math.ceil(this.totalElements / this.size);
    this.hasMore = this.page < this.totalPages - 1;

    // Aplicar paginación
    const inicio = this.page * this.size;
    const fin = inicio + this.size;
    this.productosPaginados = this.productosFiltrados.slice(inicio, fin);
  }

  onBuscar() {
    this.aplicarFiltros();
  }

  onCategoriaChange() {
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    // Verificar si hay filtros activos
    this.hasActiveFilters = !!(this.terminoBusqueda.trim() || this.categoriaSeleccionada);
    
    // Ir a la primera página cuando se aplican filtros
    this.page = 0;
    this.aplicarFiltrosYActualizarPaginacion();
  }

  // Métodos de paginación
  irAPagina(pagina: number) {
    if (pagina >= 0 && pagina < this.totalPages) {
      this.page = pagina;
      this.aplicarFiltrosYActualizarPaginacion();
    }
  }

  paginaAnterior() {
    if (this.page > 0) {
      this.irAPagina(this.page - 1);
    }
  }

  paginaSiguiente() {
    if (this.page < this.totalPages - 1) {
      this.irAPagina(this.page + 1);
    }
  }

  primeraPagina() {
    this.irAPagina(0);
  }

  ultimaPagina() {
    this.irAPagina(this.totalPages - 1);
  }

  // Generar array de números de página para mostrar
  getPaginasVisibles(): number[] {
    const paginas: number[] = [];
    const inicio = Math.max(0, this.page - 2);
    const fin = Math.min(this.totalPages - 1, this.page + 2);
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  limpiarFiltros() {
    this.terminoBusqueda = '';
    this.categoriaSeleccionada = '';
    this.hasActiveFilters = false;
    this.page = 0;
    this.aplicarFiltrosYActualizarPaginacion();
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
    
    // Verificar si el producto está activo y tiene stock
    const esActivo = producto.esActivo ?? true; // Por defecto activo si no se especifica
    const stock = producto.stock ?? 0;
    
    return esActivo && stock > 0;
  }

  isOutOfStock(producto: Producto): boolean {
    // Verificar específicamente si está sin stock
    const stock = producto.stock ?? 0;
    return stock <= 0;
  }

  getCategoriaNombre(categoria: string): string {
    return this.categoriaNombres[categoria] || categoria;
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
