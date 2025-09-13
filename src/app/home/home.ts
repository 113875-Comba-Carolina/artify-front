import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {
  // Placeholder data - will be replaced with real data later
  featuredProducts = [
    {
      id: 1,
      name: 'Cerámica Artesanal',
      price: 45.99,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
      category: 'Cerámica'
    },
    {
      id: 2,
      name: 'Textil Tradicional',
      price: 32.50,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
      category: 'Textiles'
    },
    {
      id: 3,
      name: 'Joyería Hecha a Mano',
      price: 78.00,
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop',
      category: 'Joyería'
    },
    {
      id: 4,
      name: 'Escultura en Madera',
      price: 125.00,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
      category: 'Escultura'
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
}
