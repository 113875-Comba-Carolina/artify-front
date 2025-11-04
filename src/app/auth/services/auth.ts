import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  telefono?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private userSubject = new BehaviorSubject<LoginResponse | null>(null);

  constructor(private http: HttpClient) { 
    // Inicializar con el usuario actual del localStorage
    this.userSubject.next(this.getCurrentUser());
  }

  // Observable para que otros componentes puedan suscribirse a cambios del usuario
  get user$(): Observable<LoginResponse | null> {
    return this.userSubject.asObservable();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa(email + ':' + password),
      'ngrok-skip-browser-warning': 'true' // Saltar la página de advertencia de ngrok
    });

    return this.http.get<LoginResponse>(`${this.apiUrl}/api/perfil`, { headers }).pipe(
      tap(response => {
        localStorage.setItem('currentUser', JSON.stringify(response));
        localStorage.setItem('auth', btoa(email + ':' + password));
        this.userSubject.next(response);
        // Nota: La sincronización del carrito se maneja automáticamente en CarritoService
        // cuando detecta cambios en el estado de autenticación
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('auth');
    // Limpiar el carrito local al cerrar sesión
    localStorage.removeItem('carrito');
    this.userSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth');
  }

  getCurrentUser(): LoginResponse | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  updateUser(userData: any): void {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    this.userSubject.next(userData);
  }

  registerArtesano(formData: any): Observable<any> {
    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true' // Saltar la página de advertencia de ngrok
    });
    return this.http.post(`${this.apiUrl}/api/registro/artesano`, formData, { headers });
  }

  registerUsuario(formData: any): Observable<any> {
    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true' // Saltar la página de advertencia de ngrok
    });
    return this.http.post(`${this.apiUrl}/api/registro/usuario`, formData, { headers });
  }

  forgotPassword(email: string): Observable<any> {
    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true'
    });
    return this.http.post(`${this.apiUrl}/api/auth/forgot-password`, { email }, { headers });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true'
    });
    return this.http.post(`${this.apiUrl}/api/auth/reset-password`, { token, newPassword }, { headers });
  }
}