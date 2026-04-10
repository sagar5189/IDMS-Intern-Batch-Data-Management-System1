import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSliderModule } from '@angular/material/slider';

import { BatchService } from '../../services/batch.service';
import { AuthService } from '../../services/auth.service';
import { Batch, Intern } from '../../models/models';

@Component({
  selector: 'app-batch-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatSnackBarModule, MatTooltipModule, MatCardModule,
    MatProgressSpinnerModule, MatProgressBarModule, MatSliderModule
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', overflow: 'hidden' })),
      state('expanded',  style({ height: '*', overflow: 'hidden' })),
      transition('expanded <=> collapsed',
        animate('220ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  template: `
<div class="page-container anim-fade-in">
  <div class="page-header">
    <div>
      <h1 class="page-title">Batches</h1>
      <p class="page-subtitle">{{ dataSource.filteredData.length }} of {{ allBatches.length }} batches</p>
    </div>
    <a routerLink="/batches/add" mat-raised-button color="primary" *ngIf="canEdit">
      <mat-icon>add</mat-icon> New Batch
    </a>
  </div>

  <!-- Search & Filter bar -->
  <mat-card class="filter-bar">
    <mat-card-content style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;padding:.75rem">

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Search batch name</mat-label>
        <input matInput [(ngModel)]="searchName" (ngModelChange)="applyFilters()" placeholder="e.g. Batch 2025-A">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()">
          <mat-option value="">All Status</mat-option>
          <mat-option value="UPCOMING">Upcoming</mat-option>
          <mat-option value="ACTIVE">Active</mat-option>
          <mat-option value="COMPLETED">Completed</mat-option>
        </mat-select>
      </mat-form-field>

      <div class="count-filter">
        <span class="count-filter-label">Min interns: {{ minInternCount }}</span>
        <input type="range" [(ngModel)]="minInternCount" (ngModelChange)="applyFilters()"
               min="0" [max]="maxPossibleInterns" step="1" class="range-slider">
      </div>

      <button mat-stroked-button color="warn" (click)="clearFilters()" *ngIf="hasFilters">
        <mat-icon>clear</mat-icon> Clear
      </button>
    </mat-card-content>
  </mat-card>

  <!-- Loading -->
  <div *ngIf="loading" class="loading-wrap">
    <mat-spinner diameter="40"></mat-spinner>
    <span>Loading batches…</span>
  </div>

  <!-- mat-table with expandable rows -->
  <mat-card *ngIf="!loading" class="table-card">
    <mat-card-content style="padding:0">
      <div style="overflow-x:auto">
        <table mat-table [dataSource]="dataSource" matSort multiTemplateDataRows class="full-width-table">

          <!-- Expand toggle column -->
          <ng-container matColumnDef="expand">
            <th mat-header-cell *matHeaderCellDef style="width:48px"></th>
            <td mat-cell *matCellDef="let b" style="width:48px;padding:0 4px">
              <button mat-icon-button
                      [matTooltip]="expandedId === b.id ? 'Hide interns' : 'Show interns'"
                      (click)="toggleExpand(b, $event)">
                <mat-icon style="font-size:20px;width:20px;height:20px">
                  {{ expandedId === b.id ? 'expand_less' : 'keyboard_arrow_down' }}
                </mat-icon>
              </button>
            </td>
          </ng-container>

          <!-- Batch Name -->
          <ng-container matColumnDef="batchName">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Batch Name</th>
            <td mat-cell *matCellDef="let b">
              <strong>{{ b.batchName }}</strong>
              <div *ngIf="b.description" style="font-size:.75rem;color:#888;margin-top:2px">{{ b.description }}</div>
            </td>
          </ng-container>

          <!-- Start Date -->
          <ng-container matColumnDef="startDate">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Start Date</th>
            <td mat-cell *matCellDef="let b">{{ b.startDate | date:'MMM d, yyyy' }}</td>
          </ng-container>

          <!-- End Date -->
          <ng-container matColumnDef="endDate">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>End Date</th>
            <td mat-cell *matCellDef="let b">{{ b.endDate | date:'MMM d, yyyy' }}</td>
          </ng-container>

          <!-- Status -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let b">
              <span class="status-badge"
                    [class.status-active]="b.status==='ACTIVE'"
                    [class.status-upcoming]="b.status==='UPCOMING'"
                    [class.status-completed]="b.status==='COMPLETED'">
                <span class="status-dot"></span>{{ b.status }}
              </span>
            </td>
          </ng-container>

          <!-- Progress -->
          <ng-container matColumnDef="progress">
            <th mat-header-cell *matHeaderCellDef>Progress</th>
            <td mat-cell *matCellDef="let b">
              <div class="progress-cell">
                <mat-progress-bar mode="determinate" [value]="getProgress(b)"
                  [color]="b.status === 'COMPLETED' ? 'accent' : 'primary'"
                  style="width:80px;border-radius:4px"></mat-progress-bar>
                <span style="font-size:.75rem;color:#666;margin-left:.5rem">{{ getProgress(b) | number:'1.0-0' }}%</span>
              </div>
            </td>
          </ng-container>

          <!-- Total Interns -->
          <ng-container matColumnDef="totalInterns">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Interns</th>
            <td mat-cell *matCellDef="let b">
              <mat-chip color="primary">{{ b.totalInterns }}</mat-chip>
            </td>
          </ng-container>

          <!-- Avg Score -->
          <ng-container matColumnDef="avgScore">
            <th mat-header-cell *matHeaderCellDef>Avg Score</th>
            <td mat-cell *matCellDef="let b">
              <span *ngIf="b.averagePerformanceScore != null" style="font-weight:500;color:#f57c00">
                {{ b.averagePerformanceScore | number:'1.1-1' }}
              </span>
              <span *ngIf="b.averagePerformanceScore == null" style="color:#aaa">—</span>
            </td>
          </ng-container>

          <!-- Actions -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let b">
              <a [routerLink]="['/batches', b.id, 'overview']"
                 mat-icon-button color="primary" matTooltip="Full Overview">
                <mat-icon>open_in_new</mat-icon>
              </a>
              <button mat-icon-button color="warn" matTooltip="Delete batch"
                      (click)="confirmDelete(b)" *ngIf="canDelete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <!-- ── Expanded intern-detail row ─────────────────────────────── -->
          <ng-container matColumnDef="expandedDetail">
            <td mat-cell *matCellDef="let b" [attr.colspan]="displayedColumns.length"
                style="padding:0;border-bottom:none">
              <div [@detailExpand]="b.id === expandedId ? 'expanded' : 'collapsed'"
                   class="intern-detail-container">

                <!-- Loading spinner while fetching -->
                <div *ngIf="loadingBatchId === b.id" class="detail-loading">
                  <mat-spinner diameter="22"></mat-spinner>
                  <span>Loading interns…</span>
                </div>

                <!-- Intern details mini-table -->
                <ng-container *ngIf="loadingBatchId !== b.id && internCache[b.id] !== undefined">
                  <div *ngIf="internCache[b.id].length === 0" class="detail-empty">
                    No interns assigned to this batch yet.
                  </div>

                  <table *ngIf="internCache[b.id].length > 0" class="intern-mini-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Intern ID</th>
                        <th>Name</th>
                        <th>ID Card Type</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let intern of internCache[b.id]; let i = index">
                        <td class="mini-idx">{{ i + 1 }}</td>
                        <td><span class="intern-id-chip">{{ intern.internId }}</span></td>
                        <td>
                          <div class="mini-name-cell">
                            <div class="mini-avatar">{{ intern.name.charAt(0) }}</div>
                            {{ intern.name }}
                          </div>
                        </td>
                        <td>
                          <mat-chip [color]="intern.idCardType === 'PREMIUM' ? 'primary' : 'warn'" highlighted
                                    style="font-size:.7rem">
                            {{ intern.idCardType }}
                          </mat-chip>
                        </td>
                        <td>
                          <span class="status-badge"
                                [class.status-active]="intern.status==='ACTIVE'"
                                [class.status-completed]="intern.status==='COMPLETED'"
                                [class.status-terminated]="intern.status==='TERMINATED'">
                            <span class="status-dot"></span>{{ intern.status }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </ng-container>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              class="table-row"
              [class.expanded-row]="expandedId === row.id"></tr>
          <!-- Detail row — always rendered, animated open/closed -->
          <tr mat-row *matRowDef="let row; columns: ['expandedDetail']"
              class="detail-container-row"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell empty-row" [attr.colspan]="displayedColumns.length">
              <div class="empty-state">
                <mat-icon style="font-size:48px;width:48px;height:48px;color:#ccc">search_off</mat-icon>
                <p>No batches found</p>
                <span style="color:#aaa;font-size:.85rem">Try adjusting your filters</span>
              </div>
            </td>
          </tr>
        </table>
      </div>
      <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
    </mat-card-content>
  </mat-card>

  <!-- Delete confirmation -->
  <div class="modal-overlay" *ngIf="deleteTarget" (click)="deleteTarget = null">
    <mat-card class="modal-card" (click)="$event.stopPropagation()">
      <mat-card-content style="text-align:center;padding:2rem">
        <mat-icon color="warn" style="font-size:40px;width:40px;height:40px">warning</mat-icon>
        <h3 style="margin:1rem 0 .5rem">Delete Batch?</h3>
        <p style="color:#666">Remove <strong>{{ deleteTarget.batchName }}</strong>? This cannot be undone.</p>
        <p style="color:#c62828;font-size:.8rem" *ngIf="deleteTarget && deleteTarget.totalInterns > 0">
          ⚠ This batch has {{ deleteTarget.totalInterns }} intern(s). Please reassign them first.
        </p>
        <div style="display:flex;gap:.75rem;justify-content:center;margin-top:1.5rem">
          <button mat-stroked-button (click)="deleteTarget = null">Cancel</button>
          <button mat-raised-button color="warn" (click)="doDelete()">
            <mat-icon>delete</mat-icon> Delete
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  </div>
</div>
  `,
  styles: [`
    .page-container { padding:2rem; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; }
    .page-title { font-size:1.75rem; font-weight:700; margin:0 0 .25rem; }
    .page-subtitle { color:#666; margin:0; }
    .filter-bar { margin-bottom:1.25rem; }
    .filter-field { min-width:200px; }
    .count-filter { display:flex; flex-direction:column; gap:4px; min-width:200px; }
    .count-filter-label { font-size:.8rem; color:#555; }
    .range-slider { width:100%; accent-color:#3f51b5; }
    .loading-wrap { display:flex; align-items:center; justify-content:center; gap:.75rem; padding:3rem; color:#666; }
    .table-card { overflow:hidden; }
    .full-width-table { width:100%; }
    .status-badge { display:inline-flex; align-items:center; gap:4px; font-size:.78rem; font-weight:500; padding:.2rem .6rem; border-radius:999px; }
    .status-dot { width:6px; height:6px; border-radius:50%; background:currentColor; }
    .status-active    { background:#e8f5e9; color:#2e7d32; }
    .status-upcoming  { background:#e3f2fd; color:#1565c0; }
    .status-completed { background:#f3e5f5; color:#6a1b9a; }
    .status-terminated{ background:#fce4ec; color:#c62828; }
    .progress-cell { display:flex; align-items:center; }
    .table-row:hover { background:#f9f9f9; }
    .expanded-row { background:#f0f4ff; }
    .detail-container-row { height:0; }
    .detail-container-row td { border-bottom:none; padding:0; }
    .intern-detail-container { overflow:hidden; }
    .detail-loading { display:flex; align-items:center; gap:.75rem; padding:1rem 1.5rem; color:#666; font-size:.85rem; }
    .detail-empty { padding:1rem 1.5rem; color:#aaa; font-size:.85rem; font-style:italic; }
    .intern-mini-table { width:100%; border-collapse:collapse; font-size:.8rem; background:#fafbff; }
    .intern-mini-table thead tr { background:#eef0fa; }
    .intern-mini-table th { padding:.5rem .75rem; text-align:left; font-weight:600; font-size:.72rem; text-transform:uppercase; letter-spacing:.05em; color:#555; border-bottom:1px solid #e0e0e0; }
    .intern-mini-table td { padding:.5rem .75rem; border-bottom:1px solid #f0f0f0; vertical-align:middle; }
    .intern-mini-table tr:last-child td { border-bottom:none; }
    .intern-mini-table tr:hover td { background:#eef2ff; }
    .mini-idx { color:#aaa; font-size:.75rem; width:32px; }
    .intern-id-chip { font-family:monospace; font-size:.75rem; background:rgba(63,81,181,.1); color:#3f51b5; padding:.15rem .5rem; border-radius:4px; border:1px solid rgba(63,81,181,.2); white-space:nowrap; }
    .mini-name-cell { display:flex; align-items:center; gap:.5rem; }
    .mini-avatar { width:24px; height:24px; border-radius:50%; background:linear-gradient(135deg,#3f51b5,#9c27b0); color:#fff; display:flex; align-items:center; justify-content:center; font-size:.65rem; font-weight:700; flex-shrink:0; }
    .empty-row { border-bottom:none; }
    .empty-state { display:flex; flex-direction:column; align-items:center; gap:.5rem; padding:3rem; }
    .empty-state p { font-weight:500; color:#555; margin:0; }
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index:999; }
    .modal-card { max-width:420px; width:90%; }
    .anim-fade-in { animation:fadeIn .4s ease; }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  `]
})
export class BatchListComponent implements OnInit {
  private batchService = inject(BatchService);
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  allBatches: Batch[] = [];
  dataSource = new MatTableDataSource<Batch>([]);
  loading = true;
  deleteTarget: Batch | null = null;

  // Expandable row state
  expandedId: number | null = null;
  internCache: { [batchId: number]: Intern[] } = {};
  loadingBatchId: number | null = null;

  displayedColumns = [
    'expand', 'batchName', 'startDate', 'endDate',
    'status', 'progress', 'totalInterns', 'avgScore', 'actions'
  ];

  searchName = '';
  filterStatus = '';
  minInternCount = 0;
  maxPossibleInterns = 0;

  get canEdit()   { return this.auth.hasAnyRole(['ADMIN', 'MANAGER']); }
  get canDelete() { return this.auth.hasRole('ADMIN'); }
  get hasFilters() { return this.searchName || this.filterStatus || this.minInternCount > 0; }

  ngOnInit(): void {
    this.batchService.getAll().subscribe({
      next: batches => {
        this.allBatches = batches;
        this.maxPossibleInterns = Math.max(0, ...batches.map(b => b.totalInterns));
        this.dataSource.data = batches;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.applyFilters();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  /**
   * Toggles the expanded detail row for a batch.
   * Intern details are loaded lazily on first expand and cached thereafter.
   */
  toggleExpand(batch: Batch, event: Event): void {
    event.stopPropagation();

    if (this.expandedId === batch.id) {
      this.expandedId = null;
      return;
    }

    this.expandedId = batch.id;

    // Return early if already cached
    if (this.internCache[batch.id] !== undefined) {
      return;
    }

    // Lazy-load intern details for this batch
    this.loadingBatchId = batch.id;
    this.batchService.getOverview(batch.id).subscribe({
      next: (fullBatch) => {
        this.internCache[batch.id] = fullBatch.interns ?? [];
        this.loadingBatchId = null;
      },
      error: () => {
        this.internCache[batch.id] = [];
        this.loadingBatchId = null;
        this.snack.open('Failed to load intern details', 'OK', { duration: 3000 });
      }
    });
  }

  applyFilters(): void {
    const filtered = this.allBatches.filter(b => {
      const nameMatch   = !this.searchName   || b.batchName.toLowerCase().includes(this.searchName.toLowerCase());
      const statusMatch = !this.filterStatus || b.status === this.filterStatus;
      const countMatch  = b.totalInterns >= this.minInternCount;
      return nameMatch && statusMatch && countMatch;
    });
    this.dataSource.data = filtered;
  }

  clearFilters(): void {
    this.searchName = '';
    this.filterStatus = '';
    this.minInternCount = 0;
    this.applyFilters();
  }

  getProgress(batch: Batch): number {
    if (batch.status === 'UPCOMING') return 0;
    if (batch.status === 'COMPLETED') return 100;
    const start = new Date(batch.startDate).getTime();
    const end   = new Date(batch.endDate).getTime();
    const now   = Date.now();
    return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
  }

  confirmDelete(batch: Batch): void { this.deleteTarget = batch; }

  doDelete(): void {
    if (!this.deleteTarget) return;
    if (this.deleteTarget.totalInterns > 0) {
      this.snack.open('Cannot delete batch with assigned interns', 'OK', { duration: 4000 });
      this.deleteTarget = null;
      return;
    }
    this.batchService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.allBatches = this.allBatches.filter(b => b.id !== this.deleteTarget!.id);
        delete this.internCache[this.deleteTarget!.id];
        this.applyFilters();
        this.snack.open('Batch deleted', 'OK', { duration: 3000 });
        this.deleteTarget = null;
      },
      error: (e) => this.snack.open(e.error?.message ?? 'Delete failed', 'OK', { duration: 3000 })
    });
  }
} 