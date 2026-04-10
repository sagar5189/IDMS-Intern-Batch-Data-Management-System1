import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  /** GET /api/v1/dashboard — single dedicated backend endpoint */
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(this.api);
  }
}
