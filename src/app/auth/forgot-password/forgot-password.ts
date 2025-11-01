import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  error: string = '';
  success: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';
      
      const { email } = this.forgotPasswordForm.value;
      
      this.authService.forgotPassword(email).subscribe({
        next: () => {
          this.loading = false;
          this.success = 'Se ha enviado un correo con instrucciones para recuperar tu contraseña. Por favor, revisa tu bandeja de entrada.';
          this.forgotPasswordForm.reset();
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'No se pudo procesar tu solicitud. Verifica que el correo electrónico sea correcto.';
        }
      });
    }
  }
}

