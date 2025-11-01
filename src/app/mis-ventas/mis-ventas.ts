import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/services/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Venta {
  ordenId: number;
  productoId: number;
  productoNombre: string;
  imagenUrl?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  estadoOrden: string;
  fechaCreacion: string;
  compradorNombre: string;
  compradorEmail: string;
  compradorTelefono?: string;
}

interface Estadisticas {
  totalVentas: number;
  totalIngresos: number;
  totalProductosVendidos: number;
}

@Component({
  selector: 'app-mis-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './mis-ventas.html',
  styleUrls: ['./mis-ventas.scss']
})
export class MisVentasComponent implements OnInit {
  ventas: Venta[] = [];
  estadisticas: Estadisticas = {
    totalVentas: 0,
    totalIngresos: 0,
    totalProductosVendidos: 0
  };
  isLoading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const auth = localStorage.getItem('auth');
    console.log('Auth token from localStorage:', auth);
    if (!auth) {
      throw new Error('No hay credenciales de autenticación');
    }
    
    return new HttpHeaders({
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    });
  }

  async ngOnInit() {
    window.scrollTo(0, 0);
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
    // Verificar que es artesano
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.rol !== 'ARTESANO') {
      this.router.navigate(['/']);
      return;
    }
    
    // Cargar ventas primero, luego estadísticas
    await this.cargarVentas();
    await this.cargarEstadisticas();
  }



  async cargarVentas() {
    this.isLoading = true;
    this.error = null;
    
    try {
      const backendUrl = 'https://alberta-postsymphysial-buddy.ngrok-free.dev';
      const url = `${backendUrl}/api/artesano/ventas`;
        
      console.log('Cargando ventas desde:', url);
      const headers = this.getAuthHeaders();
      const response = await this.http.get<any[]>(url, { headers }).toPromise();
      console.log('Respuesta de ventas:', response);
      this.ventas = response || [];
      
      // Si las ventas se cargaron correctamente, calcular estadísticas localmente como backup
      if (this.ventas.length > 0) {
        console.log('Ventas cargadas exitosamente, calculando estadísticas de backup...');
        this.calcularEstadisticasDesdeVentas();
      }
    } catch (error: any) {
      console.error('Error cargando ventas:', error);
      console.error('Status:', error.status);
      console.error('Error body:', error.error);
      
      if (error.status === 401) {
        this.error = 'Error de autenticación. Por favor, inicia sesión nuevamente.';
      } else if (error.status === 403) {
        this.error = 'Acceso denegado. Solo los artesanos pueden ver sus ventas.';
      } else {
        this.error = error.error?.message || `Error al cargar las ventas (${error.status})`;
      }
    } finally {
      this.isLoading = false;
    }
  }

  async cargarEstadisticas() {
    try {
      const backendUrl = 'https://alberta-postsymphysial-buddy.ngrok-free.dev';
      console.log('Cargando estadísticas desde:', `${backendUrl}/api/artesano/estadisticas`);
      const headers = this.getAuthHeaders();
      const response = await this.http.get<Estadisticas>(`${backendUrl}/api/artesano/estadisticas`, { headers }).toPromise();
      console.log('Respuesta de estadísticas:', response);
      console.log('Tipo de respuesta:', typeof response);
      console.log('Claves de la respuesta:', response ? Object.keys(response) : 'null');
      
      if (response && typeof response === 'object') {
        this.estadisticas = response;
        console.log('Estadísticas del backend aplicadas:', this.estadisticas);
      } else {
        console.log('Respuesta inválida del backend, usando estadísticas calculadas');
        this.calcularEstadisticasDesdeVentas();
      }
    } catch (error: any) {
      console.error('Error cargando estadísticas:', error);
      console.error('Status:', error.status);
      console.error('Error body:', error.error);
      
      // Si falla el backend, calcular estadísticas desde las ventas
      if (this.ventas.length > 0) {
        console.log('Calculando estadísticas desde las ventas...');
        this.calcularEstadisticasDesdeVentas();
      }
    }
  }

  calcularEstadisticasDesdeVentas() {
    if (this.ventas.length === 0) {
      this.estadisticas = {
        totalVentas: 0,
        totalIngresos: 0,
        totalProductosVendidos: 0
      };
      return;
    }

    // Agrupar por ordenId para contar órdenes únicas
    const ordenesUnicas = new Set(this.ventas.map(v => v.ordenId));
    const totalIngresos = this.ventas.reduce((sum, v) => sum + (v.subtotal || 0), 0);
    const totalProductosVendidos = this.ventas.reduce((sum, v) => sum + (v.cantidad || 0), 0);

    this.estadisticas = {
      totalVentas: ordenesUnicas.size,
      totalIngresos: totalIngresos,
      totalProductosVendidos: totalProductosVendidos
    };

    console.log('Estadísticas calculadas:', this.estadisticas);
  }


  getStatusText(estado: string): string {
    const estados: { [key: string]: string } = {
      'PAGADO': 'Pagado',
      'PENDIENTE': 'Pendiente',
      'ENVIADO': 'Enviado',
      'ENTREGADO': 'Entregado',
      'CANCELADO': 'Cancelado',
      'REEMBOLSADO': 'Reembolsado'
    };
    return estados[estado] || estado;
  }

  getStatusClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'PAGADO': 'status-paid',
      'PENDIENTE': 'status-pending',
      'ENVIADO': 'status-shipped',
      'ENTREGADO': 'status-delivered',
      'CANCELADO': 'status-cancelled',
      'REEMBOLSADO': 'status-refunded'
    };
    return clases[estado] || 'status-unknown';
  }

  formatPrice(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  }

  formatDate(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  contactarComprador(venta: Venta): void {
    if (!venta.compradorTelefono) {
      alert('El comprador no tiene número de teléfono registrado');
      return;
    }

    const nombreComprador = venta.compradorNombre || 'Cliente';
    const mensaje = `Hola ${nombreComprador}, he recibido una compra de tu parte y quiero agradecerte por confiar en mi trabajo. Me gustaría coordinar contigo la forma de entrega para tu(s) producto(s). ¿Podrías indicarme cuál es el método que prefieres?`;
    
    this.abrirWhatsApp(venta.compradorTelefono, mensaje);
  }

  private abrirWhatsApp(telefono: string, mensaje: string): void {
    // Limpiar el número de teléfono (quitar espacios, guiones, etc.)
    const numeroLimpio = telefono.replace(/[\s\-\(\)]/g, '');
    // Codificar el mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);
    // Construir la URL de WhatsApp
    const whatsappUrl = `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`;
    // Abrir WhatsApp en una nueva ventana/pestaña
    window.open(whatsappUrl, '_blank');
  }
}
