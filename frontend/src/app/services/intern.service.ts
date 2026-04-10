// intern.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Intern, CreateInternRequest, UpdateInternRequest,
  PerformanceUpdate, InternSearchParams
} from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InternService {
  private api = `${environment.apiUrl}/interns`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Intern[]> {
    return this.http.get<Intern[]>(this.api);
  }

  getById(id: number): Observable<Intern> {
    return this.http.get<Intern>(`${this.api}/${id}`);
  }

  search(params: InternSearchParams): Observable<Intern[]> {
    let httpParams = new HttpParams();
    if (params.name) httpParams = httpParams.set('name', params.name);
    if (params.batchId) httpParams = httpParams.set('batchId', params.batchId);
    if (params.idCardType) httpParams = httpParams.set('idCardType', params.idCardType);
    if (params.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<Intern[]>(`${this.api}/search`, { params: httpParams });
  }

  create(data: CreateInternRequest): Observable<Intern> {
    return this.http.post<Intern>(this.api, data);
  }

  update(id: number, data: UpdateInternRequest): Observable<Intern> {
    return this.http.put<Intern>(`${this.api}/${id}`, data);
  }

  updatePerformance(id: number, data: PerformanceUpdate): Observable<Intern> {
    return this.http.patch<Intern>(`${this.api}/${id}/performance`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }
}
