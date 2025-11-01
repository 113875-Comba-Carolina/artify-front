import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService, LoginResponse } from './auth/services/auth';
import { CarritoService } from './services/carrito.service';
import { Subscription } from 'rxjs';
import { FaqModalComponent } from './shared/faq-modal/faq-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, HttpClientModule, FaqModalComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Artify';
  isLoggedIn = false;
  currentUser: LoginResponse | null = null;
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  showFaqModal = false;
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    public carritoService: CarritoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkAuthStatus();
    // Suscribirse a cambios del usuario
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
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

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
  }

  goToCarrito() {
    this.router.navigate(['/carrito']);
  }

  goToPerfil() {
    this.router.navigate(['/perfil']);
    this.closeUserMenu();
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

  openFaqModal() {
    this.showFaqModal = true;
  }

  closeFaqModal() {
    this.showFaqModal = false;
  }
}