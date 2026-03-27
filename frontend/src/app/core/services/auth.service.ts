import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser') || 'null'));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserValue !== null;
  }

  isSystemAdmin(): boolean {
    return this.currentUserValue?.role === 'SystemAdmin';
  }

  isAdmin(): boolean {
    return this.currentUserValue?.role === 'Admin' || this.isSystemAdmin();
  }

  login(username: string, password: string): Observable<any> {
    const loginData = { username, password };
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, loginData)
      .pipe(map(user => {
        if (user && user.resultData && user.resultData.token) {
          localStorage.setItem('currentUser', JSON.stringify(user.resultData));
          this.currentUserSubject.next(user.resultData);
        }
        return user;
      }));
  }

  changePassword(userId: string, currentPassword: string, newPassword: string): Observable<any> {
    const data = { userId, currentPassword, newPassword };
    return this.http.post<any>(`${environment.apiUrl}/auth/change-password`, data);
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
