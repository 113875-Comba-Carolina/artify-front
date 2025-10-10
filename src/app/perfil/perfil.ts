import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PerfilService, Usuario, Artesano, PerfilUpdateRequest, PasswordUpdateRequest, ConvertirArtesanoRequest } from '../services/perfil';
import { AuthService } from '../auth/services/auth';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.scss']
})
export class PerfilComponent implements OnInit {
  perfil: Usuario | Artesano | null = null;
  isLoading = false;
  
  // Formularios
  perfilForm: PerfilUpdateRequest = {};
  passwordForm: PasswordUpdateRequest = {
    passwordActual: '',
    passwordNuevo: ''
  };
  artesanoForm: ConvertirArtesanoRequest = {
    nombreEmprendimiento: '',
    descripcion: '',
    ubicacion: ''
  };
  
  // Estados de edición
  editandoPerfil = false;
  editandoPassword = false;
  convirtiendoArtesano = false;
  
  // Validaciones
  formErrors: { [key: string]: string } = {};

  constructor(
    private perfilService: PerfilService,
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit() {
    // Verificar si el usuario está logueado
    if (!this.authService.isLoggedIn()) {
      this.alertService.error('Error', 'Debes iniciar sesión para acceder a tu perfil');
      this.router.navigate(['/login']);
      return;
    }
    this.cargarPerfil();
  }

  // Verificar si el usuario es artesano
  esArtesano(): boolean {
    return this.perfil?.rol === 'ARTESANO';
  }

  // Obtener información del artesano de forma segura
  getArtesanoInfo(): Artesano {
    return this.perfil as Artesano;
  }

  cargarPerfil() {
    this.isLoading = true;
    
    this.perfilService.obtenerPerfil().subscribe({
      next: (perfil) => {
        this.perfil = perfil;
        this.inicializarFormularios();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando perfil:', error);
        this.isLoading = false;
        
        if (error.status === 401) {
          this.alertService.error('Error de autenticación', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          this.authService.logout();
          this.router.navigate(['/login']);
        } else {
          this.alertService.error('Error', 'No se pudo cargar el perfil del usuario');
        }
      }
    });
  }

  inicializarFormularios() {
    if (this.perfil) {
      this.perfilForm = {
        nombre: this.perfil.nombre,
        descripcion: this.esArtesano() ? (this.perfil as Artesano).descripcion : '',
        nombreEmprendimiento: this.esArtesano() ? (this.perfil as Artesano).nombreEmprendimiento : '',
        ubicacion: this.esArtesano() ? (this.perfil as Artesano).ubicacion : ''
      };
    }
  }

  // Getters
  puedeConvertirseArtesano(): boolean {
    return this.perfil?.rol === 'USUARIO';
  }

  // Métodos de edición
  iniciarEdicionPerfil() {
    this.editandoPerfil = true;
    this.formErrors = {};
  }

  cancelarEdicionPerfil() {
    this.editandoPerfil = false;
    this.inicializarFormularios();
    this.formErrors = {};
  }

  async guardarPerfil() {
    if (!this.validarPerfilForm()) return;

    this.isLoading = true;
    this.perfilService.actualizarPerfil(this.perfilForm).subscribe({
      next: (perfilActualizado) => {
        this.perfil = perfilActualizado;
        this.editandoPerfil = false;
        this.isLoading = false;
        this.alertService.success('Perfil actualizado', 'Los datos del perfil han sido actualizados exitosamente');
      },
      error: (error) => {
        console.error('Error actualizando perfil:', error);
        this.isLoading = false;
        this.alertService.error('Error', 'No se pudo actualizar el perfil');
      }
    });
  }

  iniciarEdicionPassword() {
    this.editandoPassword = true;
    this.passwordForm = { passwordActual: '', passwordNuevo: '' };
    this.formErrors = {};
  }

  cancelarEdicionPassword() {
    this.editandoPassword = false;
    this.passwordForm = { passwordActual: '', passwordNuevo: '' };
    this.formErrors = {};
  }

  async cambiarPassword() {
    if (!this.validarPasswordForm()) return;

    this.isLoading = true;
    this.perfilService.cambiarPassword(this.passwordForm).subscribe({
      next: () => {
        this.editandoPassword = false;
        this.passwordForm = { passwordActual: '', passwordNuevo: '' };
        this.isLoading = false;
        this.alertService.success('Contraseña cambiada', 'La contraseña ha sido cambiada exitosamente');
      },
      error: (error) => {
        console.error('Error cambiando contraseña:', error);
        this.isLoading = false;
        if (error.status === 400) {
          this.alertService.error('Error', 'La contraseña actual es incorrecta');
        } else {
          this.alertService.error('Error', 'No se pudo cambiar la contraseña');
        }
      }
    });
  }

  iniciarConversionArtesano() {
    this.convirtiendoArtesano = true;
    this.artesanoForm = {
      nombreEmprendimiento: '',
      descripcion: '',
      ubicacion: ''
    };
    this.formErrors = {};
  }

  cancelarConversionArtesano() {
    this.convirtiendoArtesano = false;
    this.artesanoForm = {
      nombreEmprendimiento: '',
      descripcion: '',
      ubicacion: ''
    };
    this.formErrors = {};
  }

  async convertirArtesano() {
    if (!this.validarArtesanoForm()) return;

    const confirmed = await this.alertService.confirmCustom(
      '¿Convertirse en artesano?',
      'Una vez convertido en artesano, podrás crear y gestionar productos. Esta acción no se puede deshacer.',
      'Sí, convertirme',
      'Cancelar',
      'question'
    );

    if (!confirmed) return;

    this.isLoading = true;
    this.perfilService.convertirArtesano(this.artesanoForm).subscribe({
      next: (artesano) => {
        this.perfil = artesano;
        this.convirtiendoArtesano = false;
        this.isLoading = false;
        this.alertService.success('¡Felicidades!', 'Te has convertido en artesano exitosamente. Ahora puedes crear y gestionar productos.');
        // Actualizar el usuario en el localStorage
        this.authService.updateUser(artesano);
      },
      error: (error) => {
        console.error('Error convirtiendo a artesano:', error);
        this.isLoading = false;
        this.alertService.error('Error', 'No se pudo convertir en artesano');
      }
    });
  }

  // Validaciones
  validarPerfilForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    if (!this.perfilForm.nombre || this.perfilForm.nombre.trim() === '') {
      this.formErrors['nombre'] = 'El nombre es obligatorio';
      isValid = false;
    }

    if (this.esArtesano()) {
      if (!this.perfilForm.nombreEmprendimiento || this.perfilForm.nombreEmprendimiento.trim() === '') {
        this.formErrors['nombreEmprendimiento'] = 'El nombre del emprendimiento es obligatorio';
        isValid = false;
      }

      if (!this.perfilForm.descripcion || this.perfilForm.descripcion.trim() === '') {
        this.formErrors['descripcion'] = 'La descripción es obligatoria';
        isValid = false;
      }

      if (!this.perfilForm.ubicacion || this.perfilForm.ubicacion.trim() === '') {
        this.formErrors['ubicacion'] = 'La ubicación es obligatoria';
        isValid = false;
      }
    }

    return isValid;
  }

  validarPasswordForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    if (!this.passwordForm.passwordActual || this.passwordForm.passwordActual.trim() === '') {
      this.formErrors['passwordActual'] = 'La contraseña actual es obligatoria';
      isValid = false;
    }

    if (!this.passwordForm.passwordNuevo || this.passwordForm.passwordNuevo.trim() === '') {
      this.formErrors['passwordNuevo'] = 'La nueva contraseña es obligatoria';
      isValid = false;
    } else if (this.passwordForm.passwordNuevo.length < 6) {
      this.formErrors['passwordNuevo'] = 'La nueva contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    if (this.passwordForm.passwordActual === this.passwordForm.passwordNuevo) {
      this.formErrors['passwordNuevo'] = 'La nueva contraseña debe ser diferente a la actual';
      isValid = false;
    }

    return isValid;
  }

  validarArtesanoForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    if (!this.artesanoForm.nombreEmprendimiento || this.artesanoForm.nombreEmprendimiento.trim() === '') {
      this.formErrors['nombreEmprendimiento'] = 'El nombre del emprendimiento es obligatorio';
      isValid = false;
    }

    if (!this.artesanoForm.descripcion || this.artesanoForm.descripcion.trim() === '') {
      this.formErrors['descripcion'] = 'La descripción es obligatoria';
      isValid = false;
    }

    if (!this.artesanoForm.ubicacion || this.artesanoForm.ubicacion.trim() === '') {
      this.formErrors['ubicacion'] = 'La ubicación es obligatoria';
      isValid = false;
    }

    return isValid;
  }

  // Navegación
  volver() {
    // Usar el historial del navegador para volver a la página anterior
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Si no hay historial, navegar al home
      this.router.navigate(['/']);
    }
  }

  irAGestionProductos() {
    this.router.navigate(['/productos']);
  }
}