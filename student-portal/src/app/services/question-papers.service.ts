import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface QuestionPaper {
  _id: string;
  subject: string;
  year: string;
  semester: string;
  file_url: string;
  uploaded_by: string;
}

@Injectable({ providedIn: 'root' })
export class QuestionPapersService {
  private apiUrl = `${environment.apiUrl}/questionpapers`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(`${this.apiUrl}?_t=${Date.now()}`, { withCredentials: true });
  }

  search(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search?query=${encodeURIComponent(query)}&_t=${Date.now()}`, { withCredentials: true });
  }

  getDownloadUrl(file_url: string): string {
    return `${environment.backendUrl}${file_url}`;
  }
}
