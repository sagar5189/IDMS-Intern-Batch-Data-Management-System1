import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BatchService } from '../../services/batch.service';

@Component({
  selector: 'app-batch-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSnackBarModule, MatCardModule, MatDatepickerModule,
    MatNativeDateModule, MatIconModule, MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
<div class="page-container anim-fade-in">

  <!-- Page Header -->
  <div class="page-header">
    <div>
      <h1 class="page-title">Create Batch</h1>
      <p class="page-subtitle">Set up a new intern batch program</p>
    </div>
    <a routerLink="/batches" mat-stroked-button color="primary">
      <mat-icon>arrow_back</mat-icon>
      <span class="btn-label">Back to Batches</span>
    </a>
  </div>

  <!-- Two-column layout on desktop, single on mobile -->
  <div class="page-layout" [class.mobile]="isMobile">

    <!-- ── Left: Form ─────────────────────────────────────────── -->
    <mat-card class="form-card anim-fade-in-up">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">

          <!-- Section header -->
          <div class="section-header">
            <div class="section-icon"><mat-icon>layers</mat-icon></div>
            <h3 class="section-title">Batch Details</h3>
          </div>

          <!-- Batch Name -->
          <mat-form-field appearance="outline" class="full-width field-gap">
            <mat-label>Batch Name</mat-label>
            <input matInput formControlName="batchName" placeholder="e.g. Batch 2025-A">
            <mat-icon matSuffix>group_work</mat-icon>
            <mat-error *ngIf="form.get('batchName')?.hasError('required')">Batch name is required</mat-error>
            <mat-error *ngIf="form.get('batchName')?.hasError('minlength')">Minimum 2 characters</mat-error>
          </mat-form-field>

          <!-- Date row -->
          <div class="date-row" [class.stacked]="isMobile">

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" formControlName="startDate">
              <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
              <mat-error *ngIf="form.get('startDate')?.hasError('required')">Start date is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>End Date (Auto-calculated)</mat-label>
              <input matInput [value]="endDatePreview" readonly placeholder="Pick a start date first">
              <mat-icon matSuffix>event_available</mat-icon>
              <mat-hint>Automatically set to 6 months after start</mat-hint>
            </mat-form-field>

          </div>

          <!-- Description -->
          <mat-form-field appearance="outline" class="full-width" style="margin-top:1.25rem">
            <mat-label>Description (optional)</mat-label>
            <textarea matInput formControlName="description" rows="3"
                      placeholder="Optional notes about this batch program…"></textarea>
            <mat-icon matSuffix>notes</mat-icon>
          </mat-form-field>

          <!-- Actions -->
          <mat-divider style="margin:1.5rem 0"></mat-divider>
          <div class="form-actions" [class.stacked]="isMobile">
            <a routerLink="/batches" mat-stroked-button class="cancel-btn">Cancel</a>
            <button mat-raised-button color="primary" type="submit" [disabled]="submitting" class="submit-btn">
              <mat-spinner *ngIf="submitting" diameter="18" style="margin-right:8px"></mat-spinner>
              {{ submitting ? 'Creating…' : 'Create Batch' }}
            </button>
          </div>

        </form>
      </mat-card-content>
    </mat-card>

    <!-- ── Right: Info panel ──────────────────────────────────── -->
    <div class="info-panel anim-fade-in-up">

      <!-- Duration card -->
      <div class="info-card duration-card" *ngIf="form.value.startDate">
        <div class="info-card-header">
          <mat-icon>date_range</mat-icon>
          <span>Batch Timeline</span>
        </div>
        <div class="timeline-row">
          <div class="timeline-item">
            <div class="timeline-label">Start date</div>
            <div class="timeline-value">{{ form.value.startDate | date:'MMM d, yyyy' }}</div>
          </div>
          <div class="timeline-arrow"><mat-icon>arrow_forward</mat-icon></div>
          <div class="timeline-item">
            <div class="timeline-label">End date</div>
            <div class="timeline-value accent">{{ endDatePreview || '—' }}</div>
          </div>
        </div>
        <div class="duration-pill">
          <mat-icon style="font-size:14px;width:14px;height:14px">schedule</mat-icon>
          6 months duration · ≈ 180 days
        </div>
      </div>

      <!-- Static tips card -->
      <div class="info-card tips-card">
        <div class="info-card-header">
          <mat-icon>lightbulb_outline</mat-icon>
          <span>Tips</span>
        </div>
        <ul class="tips-list">
          <li>End date is automatically set to 6 months after start date.</li>
          <li>Interns can be assigned to this batch during registration.</li>
          <li>Batch name must be unique across all batches.</li>
          <li>You can view all interns in a batch from the Batch Overview page.</li>
        </ul>
      </div>

      <!-- ID format reminder -->
      <div class="info-card id-card-info">
        <div class="info-card-header">
          <mat-icon>fingerprint</mat-icon>
          <span>ID Format Reminder</span>
        </div>
        <div class="id-format-row">
          <div class="id-format-item free">
            <div class="id-format-label">Free Card</div>
            <div class="id-format-value">TDA20250101-001</div>
          </div>
          <div class="id-format-item premium">
            <div class="id-format-label">Premium Card</div>
            <div class="id-format-value">EMP20250101-001</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>
  `,
  styles: [`
    /* ── Page ───────────────────────────────────────────────────────────── */
    .page-container { padding: 2rem 2.5rem; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:2rem; flex-wrap:wrap; gap:1rem; }
    .page-title { font-size:1.625rem; font-weight:700; margin:0 0 .2rem; letter-spacing:-.02em; }
    .page-subtitle { color:#94a3b8; margin:0; font-size:.875rem; }

    /* ── Two-column layout ──────────────────────────────────────────────── */
    .page-layout { display:grid; grid-template-columns:1fr 300px; gap:1.75rem; align-items:start; }
    .page-layout.mobile { grid-template-columns:1fr; }

    /* ── Form Card ──────────────────────────────────────────────────────── */
    .form-card { border-radius:16px !important; }
    .full-width { width:100%; }
    .field-gap { margin-bottom:.5rem; }

    /* ── Section Header ─────────────────────────────────────────────────── */
    .section-header { display:flex; align-items:center; gap:.625rem; margin-bottom:1.25rem; }
    .section-icon { width:32px; height:32px; border-radius:8px; background:rgba(99,102,241,.12); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .section-icon mat-icon { font-size:18px; width:18px; height:18px; color:#6366f1; }
    .section-title { font-size:.75rem; font-weight:600; text-transform:uppercase; letter-spacing:.09em; color:#94a3b8; margin:0; }

    /* ── Date Row ───────────────────────────────────────────────────────── */
    .date-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    .date-row.stacked { grid-template-columns:1fr; }

    /* ── Actions ────────────────────────────────────────────────────────── */
    .form-actions { display:flex; justify-content:flex-end; gap:.75rem; align-items:center; }
    .form-actions.stacked { flex-direction:column-reverse; }
    .form-actions.stacked .cancel-btn,
    .form-actions.stacked .submit-btn { width:100%; justify-content:center; }
    .btn-label { margin-left:4px; }

    /* ── Info Panel ─────────────────────────────────────────────────────── */
    .info-panel { display:flex; flex-direction:column; gap:1rem; position:sticky; top:80px; }

    .info-card {
      background:rgba(30,41,59,.6);
      border:1px solid rgba(148,163,184,.1);
      border-radius:14px;
      padding:1.125rem;
    }

    .info-card-header {
      display:flex; align-items:center; gap:.5rem;
      font-size:.75rem; font-weight:600; text-transform:uppercase;
      letter-spacing:.08em; color:#64748b;
      margin-bottom:1rem;
    }
    .info-card-header mat-icon { font-size:16px; width:16px; height:16px; color:#6366f1; }

    /* Duration card */
    .timeline-row { display:flex; align-items:center; gap:.75rem; margin-bottom:.875rem; }
    .timeline-item { flex:1; }
    .timeline-label { font-size:.68rem; text-transform:uppercase; letter-spacing:.07em; color:#475569; margin-bottom:.2rem; }
    .timeline-value { font-size:.875rem; font-weight:600; color:#e2e8f0; }
    .timeline-value.accent { color:#6366f1; }
    .timeline-arrow mat-icon { font-size:18px; width:18px; height:18px; color:#475569; }
    .duration-pill {
      display:inline-flex; align-items:center; gap:.35rem;
      font-size:.72rem; color:#94a3b8;
      background:rgba(99,102,241,.1); border:1px solid rgba(99,102,241,.2);
      border-radius:99px; padding:.3rem .75rem;
    }

    /* Tips card */
    .tips-list { padding-left:1.1rem; margin:0; display:flex; flex-direction:column; gap:.5rem; }
    .tips-list li { font-size:.8rem; color:#94a3b8; line-height:1.5; }

    /* ID format card */
    .id-format-row { display:flex; gap:.75rem; flex-wrap:wrap; }
    .id-format-item { flex:1; min-width:120px; padding:.625rem .875rem; border-radius:8px; }
    .id-format-item.free    { background:rgba(6,182,212,.08); border:1px solid rgba(6,182,212,.2); }
    .id-format-item.premium { background:rgba(245,158,11,.08); border:1px solid rgba(245,158,11,.2); }
    .id-format-label { font-size:.65rem; text-transform:uppercase; letter-spacing:.07em; color:#64748b; margin-bottom:.25rem; }
    .id-format-value { font-family:monospace; font-size:.78rem; font-weight:600; }
    .id-format-item.free    .id-format-value { color:#06b6d4; }
    .id-format-item.premium .id-format-value { color:#f59e0b; }

    /* ── Responsive overrides ───────────────────────────────────────────── */
    @media (max-width: 1024px) {
      .page-container { padding:1.5rem; }
      .page-layout { grid-template-columns:1fr; }
      .info-panel { position:static; }
    }
    @media (max-width: 768px) {
      .page-container { padding:1rem; }
      .page-header { flex-direction:column; align-items:flex-start; }
      .date-row { grid-template-columns:1fr; }
    }
    @media (max-width: 480px) {
      .page-title { font-size:1.25rem; }
      .btn-label { display:none; }
    }

    /* ── Animations ─────────────────────────────────────────────────────── */
    .anim-fade-in    { animation:fadeIn .4s ease both; }
    .anim-fade-in-up { animation:fadeInUp .45s ease both; }
    @keyframes fadeIn   { from{opacity:0}                         to{opacity:1} }
    @keyframes fadeInUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  `]
})
export class BatchFormComponent implements OnInit {
  private fb           = inject(FormBuilder);
  private batchService = inject(BatchService);
  private snack        = inject(MatSnackBar);
  private router       = inject(Router);
  private bp           = inject(BreakpointObserver);

  submitting = false;
  isMobile   = false;

  form = this.fb.group({
    batchName:   ['', [Validators.required, Validators.minLength(2)]],
    startDate:   [null as Date | null, Validators.required],
    description: ['']
  });

  get endDatePreview(): string {
    const d = this.form.value.startDate;
    if (!d) return '';
    const date = d instanceof Date ? new Date(d) : new Date(d as string);
    date.setMonth(date.getMonth() + 6);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  ngOnInit(): void {
    // ── Responsive: stack layout on small screens ──────────────────────────
    this.bp.observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium]).subscribe(result => {
      this.isMobile = result.matches;
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const v = this.form.value;
    const d = v.startDate instanceof Date ? v.startDate : new Date(v.startDate as unknown as string);
    const startDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    this.batchService.create({
      batchName:   v.batchName!,
      startDate:   startDateStr,
      description: v.description ?? undefined
    }).subscribe({
      next:  (batch) => { this.snack.open(`Batch "${batch.batchName}" created!`, 'OK', { duration: 3000 }); this.router.navigate(['/batches']); },
      error: (e) => { this.snack.open(e.error?.message ?? 'Create failed', 'OK', { duration: 3000 }); this.submitting = false; }
    });
  }
}