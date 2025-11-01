import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  error: string = '';
  success: boolean = false;
  loading: boolean = false;
  token: string = '';
  invalidToken: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit() {
    // Obtener el token de la URL
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    
    if (!this.token) {
      this.invalidToken = true;
      this.error = 'El enlace de recuperación no es válido. Por favor, solicita un nuevo enlace.';
    }
  }

  // Validador personalizado para verificar que las contraseñas coincidan
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { mismatch: true };
  }

  get f() {
    return this.resetPasswordForm.controls;
  }

  onSubmit() {
    if (this.resetPasswordForm.valid && this.token) {
      this.loading = true;
      this.error = '';
      
      const { password } = this.resetPasswordForm.value;
      
      this.authService.resetPassword(this.token, password).subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        },
        error: (err) => {
          this.loading = false;
          if (err.status === 400) {
            this.error = 'El enlace ha expirado o no es válido. Por favor, solicita un nuevo enlace de recuperación.';
            this.invalidToken = true;
          } else {
            this.error = err.error?.message || 'No se pudo restablecer la contraseña. Por favor, intenta nuevamente.';
          }
        }
      });
    }
  }
}

