import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular Material
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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';

import { InternService } from '../../services/intern.service';
import { BatchService } from '../../services/batch.service';
import { AuthService } from '../../services/auth.service';
import { Intern, BatchSummary } from '../../models/models';

@Component({
  selector: 'app-intern-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatSnackBarModule, MatTooltipModule, MatCardModule,
    MatDialogModule, MatProgressSpinnerModule, MatBadgeModule
  ],
  template: `
<div class="page-container anim-fade-in">

  <div class="page-header">
    <div>
      <h1 class="page-title">Interns</h1>
      <p class="page-subtitle">{{ dataSource.filteredData.length }} of {{ allInterns.length }} interns</p>
    </div>
    <a routerLink="/interns/add" mat-raised-button color="primary" *ngIf="canEdit">
      <mat-icon>person_add</mat-icon> Add Intern
    </a>
  </div>

  <!-- Filter Bar -->
  <mat-card class="filter-bar">
    <mat-card-content style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;padding:.75rem">

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Search name or ID</mat-label>
        <input matInput [(ngModel)]="searchName" (ngModelChange)="applyFilters()" placeholder="Search…">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Batch</mat-label>
        <mat-select [(ngModel)]="filterBatch" (ngModelChange)="applyFilters()">
          <mat-option value="">All Batches</mat-option>
          <mat-option *ngFor="let b of batches" [value]="b.id">{{ b.batchName }}</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>ID Card Type</mat-label>
        <mat-select [(ngModel)]="filterType" (ngModelChange)="applyFilters()">
          <mat-option value="">All Types</mat-option>
          <mat-option value="PREMIUM">Premium</mat-option>
          <mat-option value="FREE">Free</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()">
          <mat-option value="">All Status</mat-option>
          <mat-option value="ACTIVE">Active</mat-option>
          <mat-option value="COMPLETED">Completed</mat-option>
          <mat-option value="TERMINATED">Terminated</mat-option>
        </mat-select>
      </mat-form-field>

      <button mat-stroked-button color="warn" (click)="clearFilters()" *ngIf="hasFilters">
        <mat-icon>clear</mat-icon> Clear
      </button>
    </mat-card-content>
  </mat-card>

  <!-- Loading -->
  <div *ngIf="loading" class="loading-wrap">
    <mat-spinner diameter="40"></mat-spinner>
    <span>Loading interns…</span>
  </div>

  <!-- mat-table -->
  <mat-card *ngIf="!loading" class="table-card">
    <mat-card-content style="padding:0">
      <div style="overflow-x:auto">
        <table mat-table [dataSource]="dataSource" matSort class="full-width-table">

          <!-- # Column -->
          <ng-container matColumnDef="index">
            <th mat-header-cell *matHeaderCellDef>#</th>
            <td mat-cell *matCellDef="let i = index">{{ i + 1 }}</td>
          </ng-container>

          <!-- Intern ID Column -->
          <ng-container matColumnDef="internId">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Intern ID</th>
            <td mat-cell *matCellDef="let i">
              <span class="intern-id-chip">{{ i.internId }}</span>
            </td>
          </ng-container>

          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
            <td mat-cell *matCellDef="let i">
              <div class="intern-name-cell">
                <div class="intern-avatar">{{ i.name.charAt(0) }}</div>
                <strong>{{ i.name }}</strong>
              </div>
            </td>
          </ng-container>

          <!-- Email Column -->
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
            <td mat-cell *matCellDef="let i">{{ i.email }}</td>
          </ng-container>

          <!-- Mobile Column -->
          <ng-container matColumnDef="mobileNumber">
            <th mat-header-cell *matHeaderCellDef>Mobile</th>
            <td mat-cell *matCellDef="let i"><span class="mono-text">{{ i.mobileNumber }}</span></td>
          </ng-container>

          <!-- Batch Column -->
          <ng-container matColumnDef="batchName">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Batch</th>
            <td mat-cell *matCellDef="let i">
              <mat-chip color="accent" highlighted>{{ i.batchName }}</mat-chip>
            </td>
          </ng-container>

          <!-- ID Card Type Column -->
          <ng-container matColumnDef="idCardType">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
            <td mat-cell *matCellDef="let i">
              <mat-chip [color]="i.idCardType === 'PREMIUM' ? 'primary' : 'warn'" highlighted>
                {{ i.idCardType }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Date of Joining Column -->
          <ng-container matColumnDef="dateOfJoining">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Joined</th>
            <td mat-cell *matCellDef="let i">{{ i.dateOfJoining | date:'MMM d, yyyy' }}</td>
          </ng-container>

          <!-- Status Column -->
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

          <!-- Score Column -->
          <ng-container matColumnDef="performanceScore">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Score</th>
            <td mat-cell *matCellDef="let i">
              <div class="score-cell" *ngIf="i.performanceScore != null">
                <div class="score-bar-wrap">
                  <div class="score-bar"
                       [style.width.%]="i.performanceScore"
                       [class.score-high]="i.performanceScore >= 75"
                       [class.score-mid]="i.performanceScore >= 50 && i.performanceScore < 75"
                       [class.score-low]="i.performanceScore < 50"></div>
                </div>
                <span class="mono-text">{{ i.performanceScore }}</span>
              </div>
              <span *ngIf="i.performanceScore == null" style="color:#aaa">—</span>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let i">
              <a [routerLink]="['/interns/edit', i.id]"
                 mat-icon-button color="primary" matTooltip="Edit" *ngIf="canEdit">
                <mat-icon>edit</mat-icon>
              </a>
              <button mat-icon-button color="warn" matTooltip="Delete"
                      (click)="confirmDelete(i)" *ngIf="canDelete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>

          <!-- No data row -->
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell empty-row" [attr.colspan]="displayedColumns.length">
              <div class="empty-state">
                <mat-icon style="font-size:48px;width:48px;height:48px;color:#ccc">search_off</mat-icon>
                <p>No interns found</p>
                <span style="color:#aaa;font-size:.85rem">Try adjusting your filters</span>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
    </mat-card-content>
  </mat-card>

  <!-- Delete confirmation overlay -->
  <div class="modal-overlay" *ngIf="deleteTarget" (click)="deleteTarget = null">
    <mat-card class="modal-card" (click)="$event.stopPropagation()">
      <mat-card-content style="text-align:center;padding:2rem">
        <mat-icon color="warn" style="font-size:40px;width:40px;height:40px">warning</mat-icon>
        <h3 style="margin:1rem 0 .5rem">Delete Intern?</h3>
        <p style="color:#666">Remove <strong>{{ deleteTarget.name }}</strong> ({{ deleteTarget.internId }})? This cannot be undone.</p>
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
    .filter-field { min-width:180px; }
    .loading-wrap { display:flex; align-items:center; justify-content:center; gap:.75rem; padding:3rem; color:#666; }
    .table-card { overflow:hidden; }
    .full-width-table { width:100%; }
    .intern-id-chip { font-family:monospace; font-size:.78rem; background:rgba(63,81,181,.1); color:#3f51b5; padding:.2rem .6rem; border-radius:4px; border:1px solid rgba(63,81,181,.2); white-space:nowrap; }
    .intern-name-cell { display:flex; align-items:center; gap:.6rem; }
    .intern-avatar { width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,#3f51b5,#9c27b0); color:#fff; display:flex; align-items:center; justify-content:center; font-size:.75rem; font-weight:700; flex-shrink:0; }
    .mono-text { font-family:monospace; font-size:.8rem; }
    .status-badge { display:inline-flex; align-items:center; gap:4px; font-size:.78rem; font-weight:500; padding:.2rem .6rem; border-radius:999px; }
    .status-dot { width:6px; height:6px; border-radius:50%; background:currentColor; }
    .status-active { background:#e8f5e9; color:#2e7d32; }
    .status-completed { background:#fff3e0; color:#e65100; }
    .status-terminated { background:#fce4ec; color:#c62828; }
    .score-cell { display:flex; align-items:center; gap:.5rem; }
    .score-bar-wrap { width:60px; height:5px; background:#eee; border-radius:999px; overflow:hidden; }
    .score-bar { height:100%; border-radius:999px; transition:width .6s; }
    .score-high { background:#4caf50; }
    .score-mid  { background:#ff9800; }
    .score-low  { background:#f44336; }
    .table-row:hover { background:#f9f9f9; }
    .empty-row { border-bottom:none; }
    .empty-state { display:flex; flex-direction:column; align-items:center; gap:.5rem; padding:3rem; }
    .empty-state p { font-weight:500; color:#555; margin:0; }
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index:999; }
    .modal-card { max-width:420px; width:90%; }
    .anim-fade-in { animation:fadeIn .4s ease; }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  `]
})
export class InternListComponent implements OnInit {
  private internService = inject(InternService);
  private batchService = inject(BatchService);
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);
  private route = inject(ActivatedRoute);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  allInterns: Intern[] = [];
  dataSource = new MatTableDataSource<Intern>([]);
  batches: BatchSummary[] = [];
  loading = true;
  deleteTarget: Intern | null = null;

  displayedColumns = [
    'index','internId','name','email','mobileNumber',
    'batchName','idCardType','dateOfJoining','status','performanceScore','actions'
  ];

  searchName = '';
  filterBatch: number | '' = '';
  filterType = '';
  filterStatus = '';

  get canEdit()   { return this.auth.hasAnyRole(['ADMIN','MANAGER']); }
  get canDelete() { return this.auth.hasRole('ADMIN'); }
  get hasFilters() { return this.searchName || this.filterBatch || this.filterType || this.filterStatus; }

  ngOnInit(): void {
    this.batchService.getSummaries().subscribe(b => this.batches = b);

    this.route.queryParams.subscribe(params => {
      if (params['search']) this.searchName = params['search'];
    });

    this.internService.getAll().subscribe({
      next: interns => {
        this.allInterns = interns;
        this.dataSource.data = interns;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.applyFilters();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilters(): void {
    const filtered = this.allInterns.filter(i => {
      const nameMatch = !this.searchName ||
        i.name.toLowerCase().includes(this.searchName.toLowerCase()) ||
        i.internId.toLowerCase().includes(this.searchName.toLowerCase());
      const batchMatch  = !this.filterBatch  || i.batchId === +this.filterBatch;
      const typeMatch   = !this.filterType   || i.idCardType === this.filterType;
      const statusMatch = !this.filterStatus || i.status === this.filterStatus;
      return nameMatch && batchMatch && typeMatch && statusMatch;
    });
    this.dataSource.data = filtered;
  }

  clearFilters(): void {
    this.searchName = '';
    this.filterBatch = '';
    this.filterType = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  confirmDelete(intern: Intern): void { this.deleteTarget = intern; }

  doDelete(): void {
    if (!this.deleteTarget) return;
    this.internService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.allInterns = this.allInterns.filter(i => i.id !== this.deleteTarget!.id);
        this.applyFilters();
        this.snack.open('Intern deleted', 'OK', { duration: 3000 });
        this.deleteTarget = null;
      },
      error: () => this.snack.open('Delete failed', 'OK', { duration: 3000 })
    });
  }
}