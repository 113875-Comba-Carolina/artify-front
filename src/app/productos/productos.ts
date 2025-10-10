import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService, Producto, ProductoRequest, Estadisticas } from '../services/producto.service';
import { AuthService } from '../auth/services/auth';
import { FileUploadComponent } from '../shared/file-upload/file-upload.component';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, FileUploadComponent],
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

  // Manejo de imagen
  selectedImage: File | null = null;
  useImageUpload = true; // Toggle entre subida de archivo y URL

  // Gestión de estados
  vistaActual: 'activos' | 'inactivos' = 'activos';
  productosInactivos: Producto[] = [];
  productosInactivosFiltrados: Producto[] = [];

  // Validación de formulario
  formErrors: { [key: string]: string } = {};
  isFormSubmitted = false;

  constructor(
    private productoService: ProductoService,
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
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

  get hasProducts(): boolean {
    if (this.vistaActual === 'inactivos') {
      return this.productosInactivosFiltrados && this.productosInactivosFiltrados.length > 0;
    }
    return this.productos && this.productos.length > 0;
  }

  loadProductos() {
    this.isLoading = true;
    this.error = '';
    
    // Cargar solo productos activos
    this.productoService.obtenerMisProductosActivos().subscribe({
      next: (response) => {
        this.productos = response.content || response as any;
        this.productosFiltrados = [...this.productos];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando productos activos:', error);
        if (error.status === 401) {
          this.error = 'No tienes permisos para acceder a esta página. Por favor, inicia sesión como artesano.';
        } else {
          this.error = 'Error al cargar los productos activos';
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
    this.selectedImage = null;
    this.useImageUpload = true;
    this.formErrors = {};
    this.isFormSubmitted = false;
    this.showForm = true;
    
    // Asegurar que estamos en vista de activos para crear productos
    this.vistaActual = 'activos';
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
    this.selectedImage = null;
    this.useImageUpload = !producto.imagenUrl; // Si ya tiene imagen URL, usar URL por defecto
    this.formErrors = {};
    this.isFormSubmitted = false;
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingProduct = null;
    this.selectedImage = null;
    this.useImageUpload = true;
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
    
    // Usar el método con imagen si hay archivo seleccionado o si se prefiere subida de archivo
    if (this.useImageUpload && this.selectedImage) {
      this.productoService.crearProductoConImagen(this.productoForm, this.selectedImage).subscribe({
        next: (producto) => {
          this.productos.unshift(producto);
          this.productosFiltrados = [...this.productos];
          this.showForm = false;
          this.alertService.success('Producto creado', 'El producto ha sido creado exitosamente con imagen');
          this.loadEstadisticas();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creando producto con imagen:', error);
          this.error = 'Error al crear el producto con imagen';
          this.isLoading = false;
        }
      });
    } else {
      // Usar el método tradicional
      this.productoService.crearProducto(this.productoForm).subscribe({
        next: (producto) => {
          this.productos.unshift(producto);
          this.productosFiltrados = [...this.productos];
          this.showForm = false;
          this.alertService.success('Producto creado', 'El producto ha sido creado exitosamente');
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
  }

  updateProduct() {
    if (!this.editingProduct?.id) return;
    
    this.isLoading = true;
    
    // Usar el método con imagen si hay archivo seleccionado o si se prefiere subida de archivo
    if (this.useImageUpload && this.selectedImage) {
      this.productoService.actualizarProductoConImagen(this.editingProduct.id, this.productoForm, this.selectedImage).subscribe({
        next: (producto) => {
          // Actualizar según la vista actual
          if (this.vistaActual === 'activos') {
            const index = this.productos.findIndex(p => p.id === producto.id);
            if (index !== -1) {
              this.productos[index] = producto;
            }
            this.productosFiltrados = [...this.productos];
          } else if (this.vistaActual === 'inactivos') {
            const index = this.productosInactivos.findIndex(p => p.id === producto.id);
            if (index !== -1) {
              this.productosInactivos[index] = producto;
            }
            this.productosInactivosFiltrados = [...this.productosInactivos];
          }
          this.showForm = false;
          this.alertService.success('Producto actualizado', 'El producto ha sido actualizado exitosamente con imagen');
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error actualizando producto con imagen:', error);
          this.error = 'Error al actualizar el producto con imagen';
          this.isLoading = false;
        }
      });
    } else {
      // Usar el método tradicional
      this.productoService.actualizarProducto(this.editingProduct.id, this.productoForm).subscribe({
        next: (producto) => {
          // Actualizar según la vista actual
          if (this.vistaActual === 'activos') {
            const index = this.productos.findIndex(p => p.id === producto.id);
            if (index !== -1) {
              this.productos[index] = producto;
            }
            this.productosFiltrados = [...this.productos];
          } else if (this.vistaActual === 'inactivos') {
            const index = this.productosInactivos.findIndex(p => p.id === producto.id);
            if (index !== -1) {
              this.productosInactivos[index] = producto;
            }
            this.productosInactivosFiltrados = [...this.productosInactivos];
          }
          this.showForm = false;
          this.alertService.success('Producto actualizado', 'El producto ha sido actualizado exitosamente');
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error actualizando producto:', error);
          this.error = 'Error al actualizar el producto';
          this.isLoading = false;
        }
      });
    }
  }

  async deleteProduct(producto: Producto) {
    if (!producto.id) return;
    
    const confirmed = await this.alertService.confirmDelete(
      '¿Eliminar producto?',
      `¿Estás seguro de que quieres eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`
    );
    
    if (!confirmed) return;

    this.alertService.loading('Eliminando producto...');
    this.productoService.eliminarProducto(producto.id).subscribe({
      next: () => {
        this.productos = this.productos.filter(p => p.id !== producto.id);
        this.productosFiltrados = [...this.productos];
        this.alertService.closeLoading();
        this.alertService.success('Producto eliminado', 'El producto ha sido eliminado exitosamente');
        this.loadEstadisticas();
      },
      error: (error) => {
        console.error('Error eliminando producto:', error);
        this.alertService.closeLoading();
        this.alertService.error('Error al eliminar', 'No se pudo eliminar el producto. Inténtalo de nuevo.');
      }
    });
  }

  // Getters para el template
  get isArtesano(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.rol === 'ARTESANO';
  }


  // Métodos de búsqueda
  onSearchChange() {
    if (this.vistaActual === 'inactivos') {
      if (!this.searchTerm.trim()) {
        this.productosInactivosFiltrados = [...this.productosInactivos];
      } else {
        this.productosInactivosFiltrados = this.productosInactivos.filter(producto =>
          producto.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          producto.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          producto.categoria.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      }
    } else {
      if (!this.searchTerm.trim()) {
        this.productosFiltrados = [...this.productos];
      } else {
        this.productosFiltrados = this.productos.filter(producto =>
          producto.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          producto.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          producto.categoria.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      }
    }
  }

  clearSearch() {
    this.searchTerm = '';
    if (this.vistaActual === 'inactivos') {
      this.productosInactivosFiltrados = [...this.productosInactivos];
    } else {
      this.productosFiltrados = [...this.productos];
    }
  }

  // Métodos para manejo de imagen
  onImageSelected(file: File) {
    this.selectedImage = file;
    this.productoForm.imagenUrl = ''; // Limpiar URL si se selecciona archivo
  }

  onImageRemoved() {
    this.selectedImage = null;
  }

  toggleImageMode() {
    this.useImageUpload = !this.useImageUpload;
    if (this.useImageUpload) {
      this.productoForm.imagenUrl = '';
    } else {
      this.selectedImage = null;
    }
  }

  // Métodos para gestión de estados
  mostrarProductosActivos() {
    this.vistaActual = 'activos';
    this.loadProductos();
  }

  mostrarProductosInactivos() {
    this.vistaActual = 'inactivos';
    this.loadProductosInactivos();
  }

  loadProductosInactivos() {
    this.isLoading = true;
    this.productoService.obtenerMisProductosInactivos(0, 100).subscribe({
      next: (response) => {
        this.productosInactivos = response.content || response as any;
        this.productosInactivosFiltrados = [...this.productosInactivos];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando productos inactivos:', error);
        this.error = 'Error al cargar los productos inactivos';
        this.isLoading = false;
      }
    });
  }

  async desactivarProducto(producto: Producto) {
    if (!producto.id) return;
    
    const confirmed = await this.alertService.confirmDeactivate(
      '¿Desactivar producto?',
      `¿Estás seguro de que quieres desactivar "${producto.nombre}"? El producto no será visible para los clientes.`
    );
    
    if (!confirmed) return;

    this.alertService.loading('Desactivando producto...');
    this.productoService.desactivarProducto(producto.id).subscribe({
      next: (productoActualizado) => {
        // Actualizar en la lista de productos activos
        const index = this.productos.findIndex(p => p.id === producto.id);
        if (index !== -1) {
          this.productos.splice(index, 1);
        }
        this.productosFiltrados = [...this.productos];
        
        // Agregar a la lista de inactivos si está visible
        if (this.vistaActual === 'inactivos') {
          this.productosInactivos.unshift(productoActualizado);
          this.productosInactivosFiltrados = [...this.productosInactivos];
        }
        
        this.alertService.closeLoading();
        this.alertService.success('Producto desactivado', 'El producto ha sido desactivado exitosamente');
        this.loadEstadisticas();
      },
      error: (error) => {
        console.error('Error desactivando producto:', error);
        this.alertService.closeLoading();
        this.alertService.error('Error al desactivar', 'No se pudo desactivar el producto. Inténtalo de nuevo.');
      }
    });
  }

  async activarProducto(producto: Producto) {
    if (!producto.id) return;
    
    const confirmed = await this.alertService.confirmActivate(
      '¿Activar producto?',
      `¿Estás seguro de que quieres activar "${producto.nombre}"? El producto será visible para los clientes.`
    );
    
    if (!confirmed) return;

    this.alertService.loading('Activando producto...');
    this.productoService.activarProducto(producto.id).subscribe({
      next: (productoActualizado) => {
        // Remover de la lista de inactivos
        const indexInactivo = this.productosInactivos.findIndex(p => p.id === producto.id);
        if (indexInactivo !== -1) {
          this.productosInactivos.splice(indexInactivo, 1);
        }
        this.productosInactivosFiltrados = [...this.productosInactivos];
        
        // Agregar a la lista de activos si estamos viendo activos
        if (this.vistaActual === 'activos') {
          this.productos.unshift(productoActualizado);
          this.productosFiltrados = [...this.productos];
        }
        
        this.alertService.closeLoading();
        this.alertService.success('Producto activado', 'El producto ha sido activado exitosamente');
        this.loadEstadisticas();
      },
      error: (error) => {
        console.error('Error activando producto:', error);
        this.alertService.closeLoading();
        this.alertService.error('Error al activar', 'No se pudo activar el producto. Inténtalo de nuevo.');
      }
    });
  }

  async eliminarProductoDefinitivamente(producto: Producto) {
    if (!producto.id) return;
    
    const confirmed = await this.alertService.confirmCustom(
      '¿Eliminar DEFINITIVAMENTE?',
      `¿Estás seguro de que quieres eliminar DEFINITIVAMENTE "${producto.nombre}"? Esta acción no se puede deshacer y el producto será eliminado permanentemente.`,
      'Sí, eliminar',
      'Cancelar',
      'error',
      '#dc2626'
    );
    
    if (!confirmed) return;

    this.alertService.loading('Eliminando definitivamente...');
    this.productoService.eliminarProductoDefinitivamente(producto.id).subscribe({
      next: () => {
        // Remover de la lista de inactivos
        this.productosInactivos = this.productosInactivos.filter(p => p.id !== producto.id);
        this.productosInactivosFiltrados = [...this.productosInactivos];
        
        this.alertService.closeLoading();
        this.alertService.success('Producto eliminado', 'El producto ha sido eliminado definitivamente');
        this.loadEstadisticas();
      },
      error: (error) => {
        console.error('Error eliminando producto definitivamente:', error);
        this.alertService.closeLoading();
        this.alertService.error('Error al eliminar', 'No se pudo eliminar el producto definitivamente. Inténtalo de nuevo.');
      }
    });
  }

  getEstadoProducto(producto: Producto): string {
    if (producto.estado) {
      switch (producto.estado) {
        case 'ACTIVO_CON_STOCK': return 'Activo';
        case 'INACTIVO': return 'Inactivo';
        case 'ACTIVO_SIN_STOCK': return 'Sin Stock';
        default: return 'Desconocido';
      }
    }
    
    // Fallback para compatibilidad
    if (!producto.esActivo) return 'Inactivo';
    if (producto.stock === 0) return 'Sin Stock';
    return 'Activo';
  }

  getEstadoClass(producto: Producto): string {
    if (producto.estado) {
      switch (producto.estado) {
        case 'ACTIVO_CON_STOCK': return 'status-active';
        case 'INACTIVO': return 'status-inactive';
        case 'ACTIVO_SIN_STOCK': return 'status-no-stock';
        default: return 'status-unknown';
      }
    }
    
    // Fallback para compatibilidad
    if (!producto.esActivo) return 'status-inactive';
    if (producto.stock === 0) return 'status-no-stock';
    return 'status-active';
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

  verDetallesProducto(producto: Producto) {
    // Navegar a la página de detalles del producto
    this.router.navigate(['/producto', producto.id]);
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
