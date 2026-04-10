import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MatProgressBarModule,
    MatDividerModule, MatTooltipModule
  ],
  template: `
<div class="page-container anim-fade-in">

  <!-- Page Header -->
  <div class="page-header">
    <div>
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Overview of your intern management system</p>
    </div>
    <a routerLink="/interns/add" mat-raised-button color="primary">
      <mat-icon>person_add</mat-icon>&nbsp;Add Intern
    </a>
  </div>

  <!-- Loading -->
  <div *ngIf="loading" class="loading-wrap">
    <mat-spinner diameter="36"></mat-spinner>
    <span>Loading stats…</span>
  </div>

  <ng-container *ngIf="!loading && stats">

    <!-- Row 1: Core metrics -->
    <div class="stat-grid">

      <div class="stat-card indigo">
        <div class="stat-inner">
          <div class="stat-top">
            <div class="stat-icon-wrap">
              <mat-icon>group</mat-icon>
            </div>
            <span class="stat-trend">Total</span>
          </div>
          <div class="stat-value">{{ stats.totalInterns }}</div>
          <div class="stat-label">Total Interns</div>
        </div>
      </div>

      <div class="stat-card green">
        <div class="stat-inner">
          <div class="stat-top">
            <div class="stat-icon-wrap">
              <mat-icon>how_to_reg</mat-icon>
            </div>
            <span class="stat-trend">Active</span>
          </div>
          <div class="stat-value">{{ stats.activeInterns }}</div>
          <div class="stat-label">Active Interns</div>
        </div>
      </div>

      <div class="stat-card amber">
        <div class="stat-inner">
          <div class="stat-top">
            <div class="stat-icon-wrap">
              <mat-icon>layers</mat-icon>
            </div>
            <span class="stat-trend">All</span>
          </div>
          <div class="stat-value">{{ stats.totalBatches }}</div>
          <div class="stat-label">Total Batches</div>
        </div>
      </div>

      <div class="stat-card violet">
        <div class="stat-inner">
          <div class="stat-top">
            <div class="stat-icon-wrap">
              <mat-icon>play_circle_outline</mat-icon>
            </div>
            <span class="stat-trend">Running</span>
          </div>
          <div class="stat-value">{{ stats.activeBatches }}</div>
          <div class="stat-label">Active Batches</div>
        </div>
      </div>

    </div>

    <!-- Row 2: Secondary metrics -->
    <div class="stat-grid" style="margin-top:1.25rem">

      <div class="stat-card teal">
        <div class="stat-inner">
          <div class="stat-top">
            <div class="stat-icon-wrap">
              <mat-icon>task_alt</mat-icon>
            </div>
            <span class="stat-trend">Done</span>
          </div>
          <div class="stat-value">{{ stats.completedBatches }}</div>
          <div class="stat-label">Completed Batches</div>
        </div>
      </div>

      <div class="stat-card rose">
        <div class="stat-inner">
          <div class="stat-top">
            <div class="stat-icon-wrap">
              <mat-icon>workspace_premium</mat-icon>
            </div>
            <span class="stat-trend">Premium</span>
          </div>
          <div class="stat-value">{{ stats.premiumInterns }}</div>
          <div class="stat-label">Premium Cards</div>
        </div>
      </div>

      <div class="stat-card cyan">
        <div class="stat-inner">
          <div class="stat-top">
            <div class="stat-icon-wrap">
              <mat-icon>credit_card</mat-icon>
            </div>
            <span class="stat-trend">Free</span>
          </div>
          <div class="stat-value">{{ stats.freeInterns }}</div>
          <div class="stat-label">Free Cards</div>
        </div>
      </div>

      <div class="stat-card orange">
        <div class="stat-inner">
          <div class="stat-top">
            <div class="stat-icon-wrap">
              <mat-icon>insights</mat-icon>
            </div>
            <span class="stat-trend">Score</span>
          </div>
          <div class="stat-value">{{ stats.averagePerformanceScore | number:'1.1-1' }}</div>
          <div class="stat-label">Avg Performance</div>
        </div>
      </div>

    </div>

    <!-- Quick Actions -->
    <div class="quick-actions-card">
      <p class="quick-actions-title">Quick Actions</p>
      <mat-divider style="margin:0.875rem 0 0; border-color:var(--border)"></mat-divider>
      <div class="quick-actions-body">
        <a routerLink="/interns/add" mat-raised-button color="primary">
          <mat-icon>person_add</mat-icon>&nbsp;Register Intern
        </a>
        <a routerLink="/batches/add" mat-raised-button color="accent">
          <mat-icon>add_circle_outline</mat-icon>&nbsp;Create Batch
        </a>
        <a routerLink="/interns" mat-stroked-button>
          <mat-icon>list</mat-icon>&nbsp;View All Interns
        </a>
        <a routerLink="/batches" mat-stroked-button>
          <mat-icon>grid_view</mat-icon>&nbsp;View All Batches
        </a>
      </div>
    </div>

  </ng-container>
</div>
  `,
  styles: [`
    .stat-trend {
      font-size: 0.72rem;
      color: var(--text-muted);
      font-weight: 500;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  stats?: DashboardStats;
  loading = true;

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: stats => { this.stats = stats; this.loading = false; },
      error: () => this.loading = false
    });
  }
}