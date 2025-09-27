import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService, LoginResponse } from './auth/services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  title = 'Artify';
  isLoggedIn = false;
  currentUser: LoginResponse | null = null;
  isMobileMenuOpen = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.currentUser = this.authService.getCurrentUser();
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.currentUser = null;
    this.closeMobileMenu();
    // Opcional: redirigir al home
    window.location.href = '/';
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  scrollToSection(sectionId: string) {
    // Si estamos en la página home, hacer scroll directamente
    if (window.location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    } else {
      // Si estamos en otra página, redirigir al home y luego hacer scroll
      // El scroll se manejará después de la navegación
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}