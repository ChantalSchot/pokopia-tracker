import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';
import { HousingKitResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class HousingKitService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<HousingKitResponse[]> {
    return this.http.get<HousingKitResponse[]>(`${environment.apiUrl}/api/housing-kits`, { withCredentials: true });
  }
}
