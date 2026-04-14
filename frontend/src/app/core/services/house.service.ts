import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';
import {
  HouseResponse, PageResponse, CreateHouseRequest, UpdateHouseRequest,
  ChangeHouseRegionRequest, UpdateHouseItemsRequest, HouseSuggestionsResponse,
  FavouriteResponse
} from '../models';

@Injectable({ providedIn: 'root' })
export class HouseService {
  private readonly apiUrl = `${environment.apiUrl}/api/houses`;

  constructor(private http: HttpClient) {}

  getAll(params: any = {}): Observable<PageResponse<HouseResponse>> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get<PageResponse<HouseResponse>>(this.apiUrl, { params: httpParams, withCredentials: true });
  }

  getById(id: string): Observable<HouseResponse> {
    return this.http.get<HouseResponse>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  create(request: CreateHouseRequest): Observable<HouseResponse> {
    return this.http.post<HouseResponse>(this.apiUrl, request, { withCredentials: true });
  }

  update(id: string, request: UpdateHouseRequest): Observable<HouseResponse> {
    return this.http.put<HouseResponse>(`${this.apiUrl}/${id}`, request, { withCredentials: true });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  changeRegion(id: string, request: ChangeHouseRegionRequest): Observable<HouseResponse> {
    return this.http.put<HouseResponse>(`${this.apiUrl}/${id}/region`, request, { withCredentials: true });
  }

  assignPokemon(houseId: string, pokemonId: string): Observable<HouseResponse> {
    return this.http.post<HouseResponse>(`${this.apiUrl}/${houseId}/pokemon/${pokemonId}`, {}, { withCredentials: true });
  }

  removePokemon(houseId: string, pokemonId: string): Observable<HouseResponse> {
    return this.http.delete<HouseResponse>(`${this.apiUrl}/${houseId}/pokemon/${pokemonId}`, { withCredentials: true });
  }

  updateItems(id: string, request: UpdateHouseItemsRequest): Observable<HouseResponse> {
    return this.http.put<HouseResponse>(`${this.apiUrl}/${id}/items`, request, { withCredentials: true });
  }

  getSuggestions(id: string): Observable<HouseSuggestionsResponse> {
    return this.http.get<HouseSuggestionsResponse>(`${this.apiUrl}/${id}/suggestions`, { withCredentials: true });
  }

  getActiveFavourites(id: string): Observable<FavouriteResponse[]> {
    return this.http.get<FavouriteResponse[]>(`${this.apiUrl}/${id}/active-favourites`, { withCredentials: true });
  }
}
