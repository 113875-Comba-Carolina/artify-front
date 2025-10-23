import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth';
import { TermsModalComponent } from '../../shared/terms-modal/terms-modal.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TermsModalComponent],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isArtesano = false;
  loading = false;
  submitted = false;
  error = '';
  redirectUrl = '/';
  showTermsModal = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Scroll hacia arriba cuando se carga el componente
    window.scrollTo(0, 0);
    
    // Leer parámetros de query
    const roleParam = this.route.snapshot.queryParams['role'];
    const redirectParam = this.route.snapshot.queryParams['redirect'];
    const preselectRole = roleParam === 'artesano' ? 'ARTESANO' : '';
    
    // Actualizar isArtesano basado en el parámetro
    this.isArtesano = preselectRole === 'ARTESANO';
    
    // Guardar la URL de redirección para después del registro
    this.redirectUrl = redirectParam || '/';
    
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      telefono: ['', [Validators.maxLength(20)]],
      rol: [preselectRole, Validators.required],
      // Campos adicionales para artesanos
      nombreEmprendimiento: [''],
      ubicacion: [''],
      descripcion: ['', Validators.maxLength(1000)],
      // Checkbox de términos y condiciones
      aceptaTerminos: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });

    // Aplicar validaciones iniciales si es artesano
    if (this.isArtesano) {
      this.registerForm.get('nombreEmprendimiento')?.setValidators([Validators.required]);
      this.registerForm.get('ubicacion')?.setValidators([Validators.required]);
      this.registerForm.get('descripcion')?.setValidators([Validators.required]);
      this.registerForm.get('nombreEmprendimiento')?.updateValueAndValidity();
      this.registerForm.get('ubicacion')?.updateValueAndValidity();
      this.registerForm.get('descripcion')?.updateValueAndValidity();
    }

    // Escuchar cambios en el rol
    this.registerForm.get('rol')?.valueChanges.subscribe(rol => {
      this.isArtesano = rol === 'ARTESANO';
      if (this.isArtesano) {
        this.registerForm.get('nombreEmprendimiento')?.setValidators([Validators.required]);
        this.registerForm.get('ubicacion')?.setValidators([Validators.required]);
        this.registerForm.get('descripcion')?.setValidators([Validators.required]);
      } else {
        this.registerForm.get('nombreEmprendimiento')?.clearValidators();
        this.registerForm.get('ubicacion')?.clearValidators();
        this.registerForm.get('descripcion')?.clearValidators();
      }
      // Actualizar el estado de validación
      this.registerForm.get('nombreEmprendimiento')?.updateValueAndValidity();
      this.registerForm.get('ubicacion')?.updateValueAndValidity();
      this.registerForm.get('descripcion')?.updateValueAndValidity();
    });
  }

  // Validador personalizado para confirmar contraseña
  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  // Getter para acceso fácil a los campos del formulario
  get f() { return this.registerForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    const formData = this.registerForm.value;

    if (this.isArtesano) {
      this.authService.registerArtesano(formData).subscribe({
        next: () => {
          // Redirigir a login con la URL de redirección
          this.router.navigate(['/auth/login'], { 
            queryParams: { redirect: this.redirectUrl } 
          });
        },
        error: (error: any) => {
          this.error = error.error?.message || 'Error al registrar usuario';
          this.loading = false;
        }
      });
    } else {
      this.authService.registerUsuario(formData).subscribe({
        next: () => {
          // Redirigir a login con la URL de redirección
          this.router.navigate(['/auth/login'], { 
            queryParams: { redirect: this.redirectUrl } 
          });
        },
        error: (error: any) => {
          this.error = error.error?.message || 'Error al registrar usuario';
          this.loading = false;
        }
      });
    }
  }

  onRoleSelect(rol: 'ARTESANO' | 'USUARIO') {
    this.registerForm.patchValue({ rol });
  }

  openTermsModal() {
    this.showTermsModal = true;
  }

  closeTermsModal() {
    this.showTermsModal = false;
  }
}

