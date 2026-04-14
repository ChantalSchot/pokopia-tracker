import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';
import { UserResponse, PageResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  getUsers(params: any = {}): Observable<PageResponse<UserResponse>> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key]) httpParams = httpParams.set(key, params[key]);
    });
    return this.http.get<PageResponse<UserResponse>>(`${this.apiUrl}/users`, { params: httpParams, withCredentials: true });
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`, { withCredentials: true });
  }

  importAll(): Observable<string> {
    return this.http.post(`${this.apiUrl}/import/all`, {}, { responseType: 'text', withCredentials: true });
  }

  importDataset(dataset: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/import/${dataset}`, {}, { responseType: 'text', withCredentials: true });
  }

  exportDataset(dataset: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/export/${dataset}`, { withCredentials: true });
  }
}
