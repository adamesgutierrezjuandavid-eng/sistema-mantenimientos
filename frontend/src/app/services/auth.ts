import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UsuarioSesion {
  id: number;
  nombre: string;
  usuario: string;
  rol: 'admin' | 'tecnico' | 'consulta';
}

export interface LoginResponse {
  ok: boolean;
  mensaje: string;
  token: string;
  usuario: UsuarioSesion;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = `${environment.apiUrl}/api/auth`;
  private tokenKey = 'mantenimientos_token';
  private usuarioKey = 'mantenimientos_usuario';

  constructor(private http: HttpClient) {}

  login(usuario: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, { usuario, password }).pipe(
      tap((respuesta) => {
        localStorage.setItem(this.tokenKey, respuesta.token);
        localStorage.setItem(this.usuarioKey, JSON.stringify(respuesta.usuario));
      })
    );
  }

  cerrarSesion() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usuarioKey);
  }

  obtenerToken() {
    return localStorage.getItem(this.tokenKey);
  }

  obtenerUsuario(): UsuarioSesion | null {
    const usuario = localStorage.getItem(this.usuarioKey);
    return usuario ? JSON.parse(usuario) : null;
  }

  obtenerSesion(): Observable<{ ok: boolean; usuario: UsuarioSesion }> {
    return this.http.get<{ ok: boolean; usuario: UsuarioSesion }>(`${this.authUrl}/me`);
  }

  obtenerTecnicos(): Observable<{ ok: boolean; usuarios: UsuarioSesion[] }> {
    return this.http.get<{ ok: boolean; usuarios: UsuarioSesion[] }>(`${this.authUrl}/usuarios`);
  }

  estaAutenticado() {
    return Boolean(this.obtenerToken() && this.obtenerUsuario());
  }
}
