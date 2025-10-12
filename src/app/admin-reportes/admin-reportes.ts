import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth/services/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// Interfaces para los reportes
interface AdminReportes {
  totalUsuarios: number;
  totalArtesanos: number;
  totalProductos: number;
  totalOrdenes: number;
  ordenesPagadas: number;
  ordenesPendientes: number;
  ordenesCanceladas: number;
  topArtesanos: any[];
  topProductos: any[];
  ventasPorCategoria: any[];
  actividadReciente: any[];
}

@Component({
  selector: 'app-admin-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-reportes.html',
  styleUrl: './admin-reportes.scss'
})
export class AdminReportesComponent implements OnInit {
  reportes: AdminReportes = {
    totalUsuarios: 0,
    totalArtesanos: 0,
    totalProductos: 0,
    totalOrdenes: 0,
    ordenesPagadas: 0,
    ordenesPendientes: 0,
    ordenesCanceladas: 0,
    topArtesanos: [],
    topProductos: [],
    ventasPorCategoria: [],
    actividadReciente: []
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
    
    if (!auth) {
      throw new Error('No hay credenciales de autenticación');
    }
    
    return new HttpHeaders({
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*'
    });
  }

  async ngOnInit() {
    window.scrollTo(0, 0);
    
    // Verificar autenticación
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
    // Verificar que es admin
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser?.rol !== 'ADMIN') {
      this.router.navigate(['/']);
      return;
    }
    
    await this.cargarReportes();
  }

  async cargarReportes() {
    this.isLoading = true;
    this.error = null;
    
    try {
      const backendUrl = 'https://alberta-postsymphysial-buddy.ngrok-free.dev';
      const url = `${backendUrl}/api/admin/reportes`;
      const headers = this.getAuthHeaders();
      
      const response = await this.http.get<AdminReportes>(url, { 
        headers,
        withCredentials: true 
      }).toPromise();
      
      this.reportes = response || this.getReportesMock();
      
    } catch (error: any) {
      if (error.status === 401) {
        this.error = 'Error de autenticación. Por favor, inicia sesión nuevamente.';
      } else if (error.status === 403) {
        this.error = 'Acceso denegado. Solo los administradores pueden ver los reportes.';
      } else {
        this.error = error.error?.message || `Error al cargar los reportes (${error.status})`;
      }
    } finally {
      this.isLoading = false;
    }
  }

  private getReportesMock(): AdminReportes {
    return {
      totalUsuarios: 0,
      totalArtesanos: 0,
      totalProductos: 0,
      totalOrdenes: 0,
      ordenesPagadas: 0,
      ordenesPendientes: 0,
      ordenesCanceladas: 0,
      topArtesanos: [],
      topProductos: [],
      ventasPorCategoria: [],
      actividadReciente: []
    };
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  getCategoriaNombre(categoria: string): string {
    const categorias: { [key: string]: string } = {
      'CERAMICA': 'Cerámica',
      'MADERA': 'Madera',
      'TEXTIL': 'Textil',
      'METAL': 'Metal',
      'VIDRIO': 'Vidrio',
      'PAPEL': 'Papel',
      'OTROS': 'Otros'
    };
    return categorias[categoria] || categoria;
  }

  formatDate(date: string | Date): string {
    const fecha = new Date(date);
    return fecha.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
