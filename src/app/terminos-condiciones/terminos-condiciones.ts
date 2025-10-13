import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-terminos-condiciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terminos-condiciones.html',
  styleUrl: './terminos-condiciones.scss'
})
export class TerminosCondicionesComponent implements OnInit {
  fechaActualizacion: Date = new Date('2025-10-12');

  constructor(private router: Router) {}

  ngOnInit() {
    window.scrollTo(0, 0);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
