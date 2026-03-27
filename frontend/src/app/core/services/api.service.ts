import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  private getHeaders(method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    let headers: any = {};
    
    if (currentUser.token) {
      headers['Authorization'] = `Bearer ${currentUser.token}`;
    }

    // Only send JSON content type on requests that actually have a JSON body.
    if ((method === 'POST' || method === 'PUT') && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  get(path: string, params: HttpParams = new HttpParams()): Observable<any> {
    return this.http.get(`${environment.apiUrl}${path}`, { params, headers: this.getHeaders('GET') });
  }

  put(path: string, body: any = {}): Observable<any> {
    return this.http.put(`${environment.apiUrl}${path}`, body, { headers: this.getHeaders('PUT', body) });
  }

  post(path: string, body: any = {}): Observable<any> {
    return this.http.post(`${environment.apiUrl}${path}`, body, { headers: this.getHeaders('POST', body) });
  }

  delete(path: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}${path}`, { headers: this.getHeaders('DELETE') });
  }
}
