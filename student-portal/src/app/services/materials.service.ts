import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Material {
  _id: string;
  title: string;
  subject: string;
  semester: string;
  file_url: string;
  uploaded_by: string;
  upload_date: string;
}

@Injectable({ providedIn: 'root' })
export class MaterialsService {
  private apiUrl = `${environment.apiUrl}/materials`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    // _t timestamp busts the browser cache — always fetches fresh data
    return this.http.get(`${this.apiUrl}?_t=${Date.now()}`, { withCredentials: true });
  }

  search(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search?query=${encodeURIComponent(query)}&_t=${Date.now()}`, { withCredentials: true });
  }

  getDownloadUrl(file_url: string): string {
    return `${environment.backendUrl}${file_url}`;
  }
}
