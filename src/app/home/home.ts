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
  isLoggedIn = false;
  currentUser: any = null;

  constructor(private authService: AuthService, private router: Router) {
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.currentUser = this.authService.getCurrentUser();
  }

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
    { name: 'Cerámica', key: 'CERAMICA', icon: 'assets/icons/categoria-ceramica.png', count: '+100' },
    { name: 'Metales', key: 'METALES', icon: 'assets/icons/metales.png', count: '+100' },
    { name: 'Mates y accesorios', key: 'MATE', icon: 'assets/icons/mate.png', count: '+100' },
    { name: 'Aromas y velas', key: 'AROMAS_VELAS', icon: 'assets/icons/aromas-velas.png', count: '+100' },
    { name: 'Textiles', key: 'TEXTILES', icon: 'assets/icons/textiles.png', count: '+100' },
    { name: 'Cuero', key: 'CUERO', icon: 'assets/icons/cuero.png', count: '+100' },
    { name: 'Madera', key: 'MADERA', icon: 'assets/icons/madera.png', count: '+100' },
    { name: 'Vidrio', key: 'VIDRIO', icon: 'assets/icons/vidrio.png', count: '+100' },
    { name: 'Joyería artesanal', key: 'JOYERIA_ARTESANAL', icon: 'assets/icons/joyeria-artesanal.png', count: '+100' },
    { name: 'Cestería y fibras', key: 'CESTERIA_FIBRAS', icon: 'assets/icons/cesteria-fibras.png', count: '+100' },
    { name: 'Arte y pintura', key: 'ARTE_PINTURA', icon: 'assets/icons/arte-pintura.png', count: '+100' },
    { name: 'Otros', key: 'OTROS', icon: 'assets/icons/otros.png', count: '+100' }
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

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  goToCategoria(categoriaKey: string) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/categoria', categoriaKey]);
    } else {
      this.router.navigate(['/auth/register'], { 
        queryParams: { 
          redirect: `/categoria/${categoriaKey}` 
        } 
      });
    }
  }
}
