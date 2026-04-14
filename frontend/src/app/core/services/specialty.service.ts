import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';
import { SpecialtyResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class SpecialtyService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<SpecialtyResponse[]> {
    return this.http.get<SpecialtyResponse[]>(`${environment.apiUrl}/api/specialties`, { withCredentials: true });
  }
}
