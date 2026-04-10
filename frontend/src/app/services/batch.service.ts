import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Batch, BatchSummary, CreateBatchRequest } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BatchService {
  private api = `${environment.apiUrl}/batches`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Batch[]> {
    return this.http.get<Batch[]>(this.api);
  }

  getSummaries(): Observable<BatchSummary[]> {
    return this.http.get<BatchSummary[]>(`${this.api}/summaries`);
  }

  getActive(): Observable<Batch[]> {
    return this.http.get<Batch[]>(`${this.api}/active`);
  }

  getById(id: number): Observable<Batch> {
    return this.http.get<Batch>(`${this.api}/${id}`);
  }

  getOverview(id: number): Observable<Batch> {
    return this.http.get<Batch>(`${this.api}/${id}/overview`);
  }

  /** FIX 6: search batches by name, status, and minimum intern count */
  search(name?: string, status?: string, minInternCount?: number): Observable<Batch[]> {
    let params = new HttpParams();
    if (name)           params = params.set('name', name);
    if (status)         params = params.set('status', status);
    if (minInternCount) params = params.set('minInternCount', minInternCount.toString());
    return this.http.get<Batch[]>(`${this.api}/search`, { params });
  }

  create(data: CreateBatchRequest): Observable<Batch> {
    return this.http.post<Batch>(this.api, data);
  }

  update(id: number, data: Partial<CreateBatchRequest>): Observable<Batch> {
    return this.http.put<Batch>(`${this.api}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }
}
