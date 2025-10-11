import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginResponse {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080';
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
    const headers = new HttpHeaders().set(
      'Authorization',
      'Basic ' + btoa(email + ':' + password)
    );

    return this.http.get<LoginResponse>(`${this.apiUrl}/api/perfil`, { headers }).pipe(
      tap(response => {
        localStorage.setItem('currentUser', JSON.stringify(response));
        localStorage.setItem('auth', btoa(email + ':' + password));
        this.userSubject.next(response);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('auth');
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
    return this.http.post(`${this.apiUrl}/api/registro/artesano`, formData);
  }

  registerUsuario(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/registro/usuario`, formData);
  }
}