import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './auth-landing.html',
  styleUrls: ['./auth-landing.scss']
})
export class AuthLandingComponent {
  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }
}

