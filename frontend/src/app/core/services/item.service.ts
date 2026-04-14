import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';
import { ItemResponse, PageResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ItemService {
  constructor(private http: HttpClient) {}

  getAll(params: any = {}): Observable<PageResponse<ItemResponse>> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get<PageResponse<ItemResponse>>(`${environment.apiUrl}/api/items`, { params: httpParams, withCredentials: true });
  }
}
