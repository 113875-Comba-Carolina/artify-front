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
    { name: 'Textiles', icon: '🧵', count: '+80' },
    { name: 'Accesorios', icon: '✨', count: '+120' },
    { name: 'Aromas', icon: '🕯️', count: '+60' },
    { name: 'Pintura', icon: '🎨', count: '+90' },
    { name: 'Cuero', icon: '👜', count: '+50' }
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
