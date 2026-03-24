import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  _id: string;
  user_id: string;
  name: string;
  role: string;
  department: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(user_id: string, name: string, password: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/login`,
      { user_id, name, password },
      { withCredentials: true }
    );
  }

  register(data: {
    user_id: string;
    name: string;
    password: string;
    role: string;
    department: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data, { withCredentials: true });
  }

  logout(): Observable<any> {
    localStorage.removeItem('dkh_user');
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }

  saveUser(user: User): void {
    localStorage.setItem('dkh_user', JSON.stringify(user));
  }

  getUser(): User | null {
    const data = localStorage.getItem('dkh_user');
    return data ? JSON.parse(data) : null;
  }

  isLoggedIn(): boolean { return !!this.getUser(); }

  isStudent(): boolean {
    const user = this.getUser();
    return !!user && user.role === 'student';
  }
}
