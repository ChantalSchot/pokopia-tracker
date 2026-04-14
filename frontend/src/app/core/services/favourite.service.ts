import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';
import { FavouriteResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class FavouriteService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<FavouriteResponse[]> {
    return this.http.get<FavouriteResponse[]>(`${environment.apiUrl}/api/favourites`, { withCredentials: true });
  }
}
