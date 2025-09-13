import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<LoginResponse> {
    const headers = new HttpHeaders().set(
      'Authorization',
      'Basic ' + btoa(email + ':' + password)
    );

    return this.http.get<LoginResponse>(`${this.apiUrl}/perfil`, { headers }).pipe(
      tap(response => {
        localStorage.setItem('user', JSON.stringify(response));
        localStorage.setItem('auth', btoa(email + ':' + password));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('auth');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth');
  }

  getCurrentUser(): LoginResponse | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  registerArtesano(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro/artesano`, formData);
  }

  registerUsuario(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro/usuario`, formData);
  }
}