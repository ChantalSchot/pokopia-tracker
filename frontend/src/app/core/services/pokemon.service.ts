import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';
import { PokemonResponse, PageResponse, UserPokemonResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getAll(params: any = {}): Observable<PageResponse<PokemonResponse>> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get<PageResponse<PokemonResponse>>(`${this.apiUrl}/pokemon`, { params: httpParams, withCredentials: true });
  }

  getById(id: string): Observable<PokemonResponse> {
    return this.http.get<PokemonResponse>(`${this.apiUrl}/pokemon/${id}`, { withCredentials: true });
  }

  getRegistered(params: any = {}): Observable<PageResponse<UserPokemonResponse>> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get<PageResponse<UserPokemonResponse>>(`${this.apiUrl}/users/me/pokemon`, { params: httpParams, withCredentials: true });
  }

  register(pokemonId: string): Observable<UserPokemonResponse> {
    return this.http.post<UserPokemonResponse>(`${this.apiUrl}/users/me/pokemon/${pokemonId}`, {}, { withCredentials: true });
  }

  unregister(pokemonId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/me/pokemon/${pokemonId}`, { withCredentials: true });
  }
}
