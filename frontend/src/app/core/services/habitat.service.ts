import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';
import { HabitatResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class HabitatService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<HabitatResponse[]> {
    return this.http.get<HabitatResponse[]>(`${environment.apiUrl}/api/habitats`, { withCredentials: true });
  }
}
