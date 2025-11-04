import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'USUARIO' | 'ARTESANO' | 'ADMIN';
  telefono?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface Artesano {
  id: number;
  nombre: string;
  email: string;
  nombreEmprendimiento: string;
  descripcion: string;
  ubicacion: string;
  telefono?: string;
  rol: 'ARTESANO';
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface PerfilUpdateRequest {
  nombre?: string;
  descripcion?: string;
  nombreEmprendimiento?: string;
  ubicacion?: string;
  telefono?: string;
}

export interface PasswordUpdateRequest {
  passwordActual: string;
  passwordNuevo: string;
}

export interface ConvertirArtesanoRequest {
  nombreEmprendimiento: string;
  descripcion: string;
  ubicacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Obtener perfil del usuario actual
  obtenerPerfil(): Observable<Usuario | Artesano> {
    const headers = this.getAuthHeaders();
    return this.http.get<Usuario | Artesano>(`${this.apiUrl}/api/perfil`, { headers });
  }

  // Actualizar perfil básico
  actualizarPerfil(perfilData: PerfilUpdateRequest): Observable<Usuario | Artesano> {
    const headers = this.getAuthHeaders();
    return this.http.put<Usuario | Artesano>(`${this.apiUrl}/api/perfil`, perfilData, { headers });
  }

  // Cambiar contraseña
  cambiarPassword(passwordData: PasswordUpdateRequest): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.apiUrl}/api/perfil/cambiar-password`, passwordData, { headers });
  }

  // Convertir usuario a artesano
  convertirArtesano(artesanoData: ConvertirArtesanoRequest): Observable<Artesano> {
    const headers = this.getAuthHeaders();
    return this.http.post<Artesano>(`${this.apiUrl}/api/perfil/convertir-artesano`, artesanoData, { headers });
  }

  // Verificar si el usuario puede convertirse en artesano
  puedeConvertirseArtesano(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.rol === 'USUARIO';
  }

  // Obtener headers de autenticación
  private getAuthHeaders(): HttpHeaders {
    const auth = localStorage.getItem('auth');
    if (!auth) {
      throw new Error('No hay credenciales de autenticación');
    }
    return new HttpHeaders({
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true' // Saltar la página de advertencia de ngrok
    });
  }
}