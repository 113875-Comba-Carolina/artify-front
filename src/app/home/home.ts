import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth/services/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {
  constructor(private authService: AuthService, private router: Router) {}

  // Productos destacados con imágenes locales
  featuredProducts = [
    {
      id: 1,
      name: 'Taza de Cerámica',
      price: 5000,
      image: 'assets/images/taza-ceramica.jpeg',
      category: 'Cerámica'
    },
    {
      id: 2,
      name: 'Mate de Calabaza',
      price: 23000,
      image: 'assets/images/mate-calabaza.jpg',
      category: 'Mates'
    },
    {
      id: 3,
      name: 'Artesanía metalica',
      price: 15000,
      image: 'assets/images/metalicas.jpg',
      category: 'Metales'
    },
    {
      id: 4,
      name: 'Velas Aromatizantes',
      price: 9000,
      image: 'assets/images/velas-aromatizantes.jpeg',
      category: 'Aromas'
    }
  ];

  categories = [
    { name: 'Cerámica', icon: '🏺', count: '+100' },
    { name: 'Metales', icon: '⚒️', count: '+100' },
    { name: 'Mates y accesorios', icon: '🧉', count: '+100' },
    { name: 'Aromas y velas', icon: '🕯️', count: '+100' },
    { name: 'Textiles', icon: '🧵', count: '+100' },
    { name: 'Cuero', icon: '👜', count: '+100' },
    { name: 'Madera', icon: '🪵', count: '+100' },
    { name: 'Vidrio', icon: '🔮', count: '+100' },
    { name: 'Joyería artesanal', icon: '💎', count: '+100' },
    { name: 'Papel y cartón', icon: '📄', count: '+100' },
    { name: 'Cestería y fibras', icon: '🧺', count: '+100' },
    { name: 'Arte y pintura', icon: '🎨', count: '+100' }
  ];

  onVerDetalles(product: any) {
    if (this.authService.isLoggedIn()) {
      // Usuario logueado - redirigir a página de detalles del producto
      // Por ahora redirigimos a home, pero aquí iría la lógica para ver detalles
      console.log('Ver detalles del producto:', product);
      // this.router.navigate(['/producto', product.id]);
    } else {
      // Usuario no logueado - redirigir a login
      this.router.navigate(['/auth/login']);
    }
  }
}
