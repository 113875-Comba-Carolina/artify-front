import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService, Producto, ProductoRequest, Estadisticas } from '../services/producto.service';
import { AuthService } from '../auth/services/auth';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrls: ['./productos.scss']
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categorias: string[] = [];
  estadisticas: Estadisticas | null = null;
  isLoading = false;
  error = '';
  success = '';
  searchTerm = '';

  // Formulario
  showForm = false;
  editingProduct: Producto | null = null;
  productoForm: ProductoRequest = {
    nombre: '',
    descripcion: '',
    precio: 0,
    categoria: '',
    stock: 0,
    imagenUrl: ''
  };

  // Validación de formulario
  formErrors: { [key: string]: string } = {};
  isFormSubmitted = false;

  constructor(
    private productoService: ProductoService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Verificar que el usuario esté autenticado y sea artesano
    if (!this.authService.isLoggedIn()) {
      this.error = 'Debes iniciar sesión para acceder a esta página.';
      return;
    }
    
    const user = this.authService.getCurrentUser();
    if (user?.rol !== 'ARTESANO') {
      this.error = 'Solo los artesanos pueden acceder a la gestión de productos.';
      return;
    }
    
    this.loadProductos();
    this.loadCategorias();
    this.loadEstadisticas();
  }

  loadProductos() {
    this.isLoading = true;
    this.error = '';
    
    this.productoService.obtenerMisProductos().subscribe({
      next: (response) => {
        this.productos = response.content || response as any;
        this.productosFiltrados = [...this.productos];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
        if (error.status === 401) {
          this.error = 'No tienes permisos para acceder a esta página. Por favor, inicia sesión como artesano.';
        } else {
          this.error = 'Error al cargar los productos';
        }
        this.isLoading = false;
      }
    });
  }

  loadCategorias() {
    // Categorías hardcodeadas - no necesitamos llamar al API
    this.categorias = [
      'CERAMICA', 'METALES', 'MATE', 'AROMAS_VELAS', 'TEXTILES',
      'CUERO', 'MADERA', 'VIDRIO', 'JOYERIA_ARTESANAL',
      'CESTERIA_FIBRAS', 'ARTE_PINTURA', 'OTROS'
    ];
  }

  loadEstadisticas() {
    this.productoService.obtenerMisEstadisticas().subscribe({
      next: (estadisticas) => {
        this.estadisticas = estadisticas;
      },
      error: (error) => {
        console.error('Error cargando estadísticas:', error);
      }
    });
  }

  // Formulario
  showCreateForm() {
    this.editingProduct = null;
    this.productoForm = {
      nombre: '',
      descripcion: '',
      precio: 0,
      categoria: '',
      stock: 0,
      imagenUrl: ''
    };
    this.formErrors = {};
    this.isFormSubmitted = false;
    this.showForm = true;
  }

  showEditForm(producto: Producto) {
    this.editingProduct = producto;
    this.productoForm = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      categoria: producto.categoria,
      stock: producto.stock,
      imagenUrl: producto.imagenUrl || ''
    };
    this.formErrors = {};
    this.isFormSubmitted = false;
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingProduct = null;
    this.error = '';
    this.success = '';
    this.formErrors = {};
    this.isFormSubmitted = false;
  }

  onSubmit() {
    this.error = '';
    this.success = '';
    this.isFormSubmitted = true;

    // Validar formulario
    if (!this.validateForm()) {
      return;
    }

    if (this.editingProduct) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }

  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    // Validar nombre
    if (!this.productoForm.nombre || this.productoForm.nombre.trim() === '') {
      this.formErrors['nombre'] = 'El nombre del producto es obligatorio';
      isValid = false;
    }

    // Validar descripción
    if (!this.productoForm.descripcion || this.productoForm.descripcion.trim() === '') {
      this.formErrors['descripcion'] = 'La descripción es obligatoria';
      isValid = false;
    }

    // Validar precio
    if (!this.productoForm.precio || this.productoForm.precio <= 0) {
      this.formErrors['precio'] = 'El precio debe ser mayor a 0';
      isValid = false;
    }

    // Validar categoría
    if (!this.productoForm.categoria || this.productoForm.categoria === '') {
      this.formErrors['categoria'] = 'La categoría es obligatoria';
      isValid = false;
    }

    // Validar stock
    if (this.productoForm.stock === null || this.productoForm.stock < 0) {
      this.formErrors['stock'] = 'El stock debe ser mayor o igual a 0';
      isValid = false;
    }

    return isValid;
  }

  // Método para verificar si un campo tiene error
  hasFieldError(fieldName: string): boolean {
    return this.isFormSubmitted && !!this.formErrors[fieldName];
  }

  // Método para obtener el mensaje de error de un campo
  getFieldError(fieldName: string): string {
    return this.formErrors[fieldName] || '';
  }

  // Validación en tiempo real
  onFieldChange(fieldName: string) {
    if (this.isFormSubmitted) {
      // Solo validar si ya se intentó enviar el formulario
      this.validateField(fieldName);
    }
  }

  validateField(fieldName: string) {
    switch (fieldName) {
      case 'nombre':
        if (!this.productoForm.nombre || this.productoForm.nombre.trim() === '') {
          this.formErrors['nombre'] = 'El nombre del producto es obligatorio';
        } else {
          delete this.formErrors['nombre'];
        }
        break;
      case 'descripcion':
        if (!this.productoForm.descripcion || this.productoForm.descripcion.trim() === '') {
          this.formErrors['descripcion'] = 'La descripción es obligatoria';
        } else {
          delete this.formErrors['descripcion'];
        }
        break;
      case 'precio':
        if (!this.productoForm.precio || this.productoForm.precio <= 0) {
          this.formErrors['precio'] = 'El precio debe ser mayor a 0';
        } else {
          delete this.formErrors['precio'];
        }
        break;
      case 'categoria':
        if (!this.productoForm.categoria || this.productoForm.categoria === '') {
          this.formErrors['categoria'] = 'La categoría es obligatoria';
        } else {
          delete this.formErrors['categoria'];
        }
        break;
      case 'stock':
        if (this.productoForm.stock === null || this.productoForm.stock < 0) {
          this.formErrors['stock'] = 'El stock debe ser mayor o igual a 0';
        } else {
          delete this.formErrors['stock'];
        }
        break;
    }
  }

  createProduct() {
    this.isLoading = true;
    this.productoService.crearProducto(this.productoForm).subscribe({
      next: (producto) => {
        this.productos.unshift(producto);
        this.productosFiltrados = [...this.productos];
        this.showForm = false;
        this.success = 'Producto creado exitosamente';
        this.loadEstadisticas();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creando producto:', error);
        this.error = 'Error al crear el producto';
        this.isLoading = false;
      }
    });
  }

  updateProduct() {
    if (!this.editingProduct?.id) return;
    
    this.isLoading = true;
    this.productoService.actualizarProducto(this.editingProduct.id, this.productoForm).subscribe({
      next: (producto) => {
        const index = this.productos.findIndex(p => p.id === producto.id);
        if (index !== -1) {
          this.productos[index] = producto;
        }
        this.productosFiltrados = [...this.productos];
        this.showForm = false;
        this.success = 'Producto actualizado exitosamente';
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error actualizando producto:', error);
        this.error = 'Error al actualizar el producto';
        this.isLoading = false;
      }
    });
  }

  deleteProduct(producto: Producto) {
    if (!producto.id) return;
    
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    this.isLoading = true;
    this.productoService.eliminarProducto(producto.id).subscribe({
      next: () => {
        this.productos = this.productos.filter(p => p.id !== producto.id);
        this.productosFiltrados = [...this.productos];
        this.success = 'Producto eliminado exitosamente';
        this.loadEstadisticas();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error eliminando producto:', error);
        this.error = 'Error al eliminar el producto';
        this.isLoading = false;
      }
    });
  }

  // Getters para el template
  get isArtesano(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.rol === 'ARTESANO';
  }

  get hasProducts(): boolean {
    return this.productosFiltrados.length > 0;
  }

  // Métodos de búsqueda
  onSearchChange() {
    if (!this.searchTerm.trim()) {
      this.productosFiltrados = [...this.productos];
    } else {
      this.productosFiltrados = this.productos.filter(producto =>
        producto.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.productosFiltrados = [...this.productos];
  }

  getCategoriaNombre(categoria: string): string {
    const categoriaMap: { [key: string]: string } = {
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
    return categoriaMap[categoria] || categoria;
  }
}
