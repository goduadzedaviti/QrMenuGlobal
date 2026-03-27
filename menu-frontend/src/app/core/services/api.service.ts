import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  get(path: string, params: HttpParams = new HttpParams()): Observable<any> {
    return this.http.get(`${environment.apiUrl}${path}`, { params });
  }

  put(path: string, body: Object = {}): Observable<any> {
    return this.http.put(`${environment.apiUrl}${path}`, JSON.stringify(body));
  }

  post(path: string, body: Object = {}): Observable<any> {
    return this.http.post(`${environment.apiUrl}${path}`, JSON.stringify(body));
  }

  delete(path: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}${path}`);
  }
}
