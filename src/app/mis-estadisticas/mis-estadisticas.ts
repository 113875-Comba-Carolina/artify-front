import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth/services/auth';
import { AlertService } from '../services/alert.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface BuyerStatistics {
  totalOrdenes: number;
  totalGastado: number;
  totalProductos: number;
  promedioPorCompra: number;
  categoriasFavoritas: CategoriaFavorita[];
  productosMasComprados: ProductoMasComprado[];
  artesanosFavoritos: ArtesanoFavorito[];
}

interface CategoriaFavorita {
  categoria: string;
  cantidadComprada: number;
  totalGastado: number;
}

interface ProductoMasComprado {
  nombre: string;
  imagenUrl: string;
  totalComprado: number;
  totalGastado: number;
}

interface ArtesanoFavorito {
  nombre: string;
  ordenesConArtesano: number;
  totalGastado: number;
}

@Component({
  selector: 'app-mis-estadisticas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-estadisticas.html',
  styleUrls: ['./mis-estadisticas.scss']
})
export class MisEstadisticasComponent implements OnInit {
  estadisticas: BuyerStatistics | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Verificar si el usuario está autenticado
    if (!this.authService.isLoggedIn()) {
      console.log('Usuario no autenticado, redirigiendo al login...');
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: '/mis-estadisticas' } 
      });
      return;
    }
    
    console.log('Usuario autenticado, cargando estadísticas...');
    this.cargarEstadisticas();
  }

  async cargarEstadisticas() {
    this.isLoading = true;
    this.error = null;

    try {
      const auth = localStorage.getItem('auth');
      if (!auth) {
        console.log('No hay credenciales de autenticación');
        this.error = 'Error de autenticación';
        this.isLoading = false;
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      });

      this.estadisticas = await this.http.get<BuyerStatistics>(
        `${environment.apiUrl}/api/ordenes/estadisticas`,
        { headers }
      ).toPromise() || null;

      console.log('Estadísticas cargadas:', this.estadisticas);
    } catch (error: any) {
      console.error('Error cargando estadísticas:', error);
      this.error = 'Error al cargar tus estadísticas. Por favor, intenta nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  }

  formatearCategoria(categoria: string): string {
    const categorias: { [key: string]: string } = {
      'CERAMICA': 'Cerámica',
      'MADERA': 'Madera',
      'TEXTILES': 'Textiles',
      'CUERO': 'Cuero',
      'JOYERIA_ARTESANAL': 'Joy architectural',
      'AROMAS_VELAS': 'Aromas y Velas',
      'VIDRIO': 'Vidrio',
      'METALES': 'Metales',
      'CESTERIA_FIBRAS': 'Cestería y Fibras',
      'MATE': 'Mate'
    };
    return categorias[categoria] || categoria;
  }

  irAMisOrdenes(): void {
    this.router.navigate(['/mis-ordenes']);
  }
}

