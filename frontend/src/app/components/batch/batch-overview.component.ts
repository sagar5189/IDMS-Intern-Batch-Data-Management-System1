import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BatchService } from '../../services/batch.service';
import { Batch, Intern } from '../../models/models';

@Component({
  selector: 'app-batch-overview',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatChipsModule, MatIconModule, MatCardModule, MatProgressSpinnerModule
  ],
  template: `
<div class="page-container anim-fade-in" *ngIf="batch">
  <div class="page-header">
    <div>
      <h1 class="page-title">{{ batch.batchName }}</h1>
      <p class="page-subtitle">{{ batch.startDate | date:'MMM d' }} – {{ batch.endDate | date:'MMM d, yyyy' }}</p>
    </div>
    <div class="header-right">
      <span class="badge"
            [class.badge-green]="batch.status==='ACTIVE'"
            [class.badge-amber]="batch.status==='UPCOMING'"
            [class.badge-violet]="batch.status==='COMPLETED'">
        {{ batch.status }}
      </span>
      <a routerLink="/batches" class="btn-secondary">← Batches</a>
    </div>
  </div>

  <!-- Stats row -->
  <div class="stats-grid">
    <div class="stat-card blue anim-fade-in-up">
      <div class="stat-value">{{ batch.totalInterns }}</div>
      <div class="stat-label">Total Interns</div>
    </div>
    <div class="stat-card amber anim-fade-in-up">
      <div class="stat-value">
        {{ batch.averagePerformanceScore != null ? (batch.averagePerformanceScore | number:'1.1-1') : '—' }}
      </div>
      <div class="stat-label">Avg Performance</div>
    </div>
    <div class="stat-card green anim-fade-in-up">
      <div class="stat-value">{{ premiumCount }}</div>
      <div class="stat-label">Premium Cards</div>
    </div>
    <div class="stat-card violet anim-fade-in-up">
      <div class="stat-value">{{ activeCount }}</div>
      <div class="stat-label">Active Interns</div>
    </div>
  </div>

  <!-- Intern details table with pagination -->
  <mat-card class="table-card anim-fade-in-up">
    <div class="table-header">
      <h3>Intern Details</h3>
      <span class="intern-count">{{ internDataSource.filteredData.length }} interns</span>
    </div>

    <div style="overflow-x:auto">
      <table mat-table [dataSource]="internDataSource" matSort class="intern-table">

        <!-- # -->
        <ng-container matColumnDef="index">
          <th mat-header-cell *matHeaderCellDef>#</th>
          <td mat-cell *matCellDef="let i = index">{{ i + 1 }}</td>
        </ng-container>

        <!-- Intern ID -->
        <ng-container matColumnDef="internId">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Intern ID</th>
          <td mat-cell *matCellDef="let i">
            <span class="intern-id-chip">{{ i.internId }}</span>
          </td>
        </ng-container>

        <!-- Name -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
          <td mat-cell *matCellDef="let i">
            <div class="name-cell">
              <div class="avatar">{{ i.name.charAt(0) }}</div>
              {{ i.name }}
            </div>
          </td>
        </ng-container>

        <!-- Email -->
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
          <td mat-cell *matCellDef="let i" class="text-muted">{{ i.email }}</td>
        </ng-container>

        <!-- Mobile -->
        <ng-container matColumnDef="mobileNumber">
          <th mat-header-cell *matHeaderCellDef>Mobile</th>
          <td mat-cell *matCellDef="let i"><span class="mono">{{ i.mobileNumber }}</span></td>
        </ng-container>

        <!-- ID Card Type -->
        <ng-container matColumnDef="idCardType">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
          <td mat-cell *matCellDef="let i">
            <mat-chip [color]="i.idCardType === 'PREMIUM' ? 'primary' : 'warn'" highlighted
                      style="font-size:.72rem">
              {{ i.idCardType }}
            </mat-chip>
          </td>
        </ng-container>

        <!-- Date of Joining -->
        <ng-container matColumnDef="dateOfJoining">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Joined</th>
          <td mat-cell *matCellDef="let i" class="text-muted">{{ i.dateOfJoining | date:'MMM d, yyyy' }}</td>
        </ng-container>

        <!-- Status -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
          <td mat-cell *matCellDef="let i">
            <span class="status-badge"
                  [class.status-active]="i.status==='ACTIVE'"
                  [class.status-completed]="i.status==='COMPLETED'"
                  [class.status-terminated]="i.status==='TERMINATED'">
              <span class="status-dot"></span>{{ i.status }}
            </span>
          </td>
        </ng-container>

        <!-- Score -->
        <ng-container matColumnDef="performanceScore">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Score</th>
          <td mat-cell *matCellDef="let i">
            <span *ngIf="i.performanceScore != null" class="mono">{{ i.performanceScore }}/100</span>
            <span *ngIf="i.performanceScore == null" class="text-muted">—</span>
          </td>
        </ng-container>

        <!-- Remarks -->
        <ng-container matColumnDef="performanceRemarks">
          <th mat-header-cell *matHeaderCellDef>Remarks</th>
          <td mat-cell *matCellDef="let i" class="text-muted" style="font-size:.8rem">
            {{ i.performanceRemarks || '—' }}
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="internColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: internColumns;" class="table-row"></tr>

        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell" [attr.colspan]="internColumns.length">
            <div class="empty-state">No interns in this batch yet.</div>
          </td>
        </tr>
      </table>
    </div>

    <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
  </mat-card>
</div>

<!-- Loading spinner -->
<div *ngIf="loading" class="loading-wrap">
  <mat-spinner diameter="40"></mat-spinner>
</div>
  `,
  styles: [`
    .page-container { padding:2rem; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:2rem; flex-wrap:wrap; gap:1rem; }
    .page-title { font-size:1.75rem; font-weight:700; margin:0 0 .25rem; }
    .page-subtitle { color:#666; margin:0; }
    .header-right { display:flex; align-items:center; gap:.75rem; flex-wrap:wrap; }
    .stats-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:1rem; margin-bottom:1.5rem; }
    .stat-card { border-radius:12px; padding:1.25rem; }
    .stat-card.blue    { background:#e3f2fd; }
    .stat-card.amber   { background:#fff8e1; }
    .stat-card.green   { background:#e8f5e9; }
    .stat-card.violet  { background:#f3e5f5; }
    .stat-value { font-size:2rem; font-weight:700; letter-spacing:-.03em; line-height:1; margin-bottom:.4rem; color:#333; }
    .stat-label { font-size:.72rem; color:#666; text-transform:uppercase; letter-spacing:.06em; }
    .table-card { overflow:hidden; border-radius:12px; }
    .table-header { display:flex; justify-content:space-between; align-items:center; padding:1.25rem 1.5rem; border-bottom:1px solid #eee; }
    .table-header h3 { margin:0; font-size:1rem; font-weight:600; }
    .intern-count { font-size:.8rem; color:#888; }
    .intern-table { width:100%; }
    .intern-id-chip { font-family:monospace; font-size:.75rem; background:rgba(63,81,181,.1); color:#3f51b5; padding:.15rem .5rem; border-radius:4px; border:1px solid rgba(63,81,181,.2); white-space:nowrap; }
    .name-cell { display:flex; align-items:center; gap:.5rem; }
    .avatar { width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,#3f51b5,#9c27b0); color:#fff; display:flex; align-items:center; justify-content:center; font-size:.7rem; font-weight:700; flex-shrink:0; }
    .mono { font-family:monospace; font-size:.8rem; }
    .text-muted { color:#666; }
    .status-badge { display:inline-flex; align-items:center; gap:4px; font-size:.75rem; font-weight:500; padding:.2rem .6rem; border-radius:999px; }
    .status-dot { width:6px; height:6px; border-radius:50%; background:currentColor; }
    .status-active    { background:#e8f5e9; color:#2e7d32; }
    .status-completed { background:#fff3e0; color:#e65100; }
    .status-terminated{ background:#fce4ec; color:#c62828; }
    .table-row:hover { background:#f9f9f9; }
    .empty-state { text-align:center; padding:2.5rem; color:#aaa; font-style:italic; }
    .loading-wrap { display:flex; justify-content:center; align-items:center; min-height:50vh; }
    .badge { display:inline-flex; align-items:center; padding:.3rem .8rem; border-radius:999px; font-size:.78rem; font-weight:600; }
    .badge-green  { background:#e8f5e9; color:#2e7d32; }
    .badge-amber  { background:#fff8e1; color:#f57f17; }
    .badge-violet { background:#f3e5f5; color:#6a1b9a; }
    .btn-secondary { display:inline-flex; align-items:center; padding:.4rem .9rem; border:1px solid #ccc; border-radius:6px; text-decoration:none; font-size:.85rem; color:#555; background:#fff; }
    .btn-secondary:hover { background:#f5f5f5; }
    .anim-fade-in { animation:fadeIn .4s ease; }
    .anim-fade-in-up { animation:fadeInUp .4s ease; }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @media(max-width:600px) { .page-container { padding:1rem; } }
  `]
})
export class BatchOverviewComponent implements OnInit {
  private batchService = inject(BatchService);
  private route = inject(ActivatedRoute);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  batch?: Batch;
  loading = true;
  internDataSource = new MatTableDataSource<Intern>([]);

  internColumns = [
    'index', 'internId', 'name', 'email', 'mobileNumber',
    'idCardType', 'dateOfJoining', 'status', 'performanceScore', 'performanceRemarks'
  ];

  get premiumCount() { return this.batch?.interns?.filter(i => i.idCardType === 'PREMIUM').length ?? 0; }
  get activeCount()  { return this.batch?.interns?.filter(i => i.status === 'ACTIVE').length ?? 0; }

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    this.batchService.getOverview(id).subscribe({
      next: b => {
        this.batch = b;
        this.internDataSource.data = b.interns ?? [];
        // Use setTimeout to allow *ngIf="batch" to render the table before wiring up
        setTimeout(() => {
          this.internDataSource.paginator = this.paginator;
          this.internDataSource.sort = this.sort;
        });
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
