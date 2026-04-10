import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { InternService } from '../../services/intern.service';
import { BatchService } from '../../services/batch.service';
import { BatchSummary } from '../../models/models';
@Component({
  selector: 'app-intern-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatSnackBarModule, MatCardModule,
    MatRadioModule, MatDatepickerModule, MatNativeDateModule,
    MatIconModule, MatProgressSpinnerModule, MatDividerModule,
    MatStepperModule
  ],
  template: `
<div class="page-container anim-fade-in">
  <!-- Page Header -->
  <div class="page-header">
    <div>
      <h1 class="page-title">{{ isEdit ? 'Edit Intern' : 'Register Intern' }}</h1>
      <p class="page-subtitle">{{ isEdit ? 'Update intern information' : 'Add a new intern to the program' }}</p>
    </div>
    <a routerLink="/interns" mat-stroked-button color="primary">
      <mat-icon>arrow_back</mat-icon>
      <span class="btn-label">Back to List</span>
    </a>
  </div>
  <div class="form-layout" [class.mobile]="isMobile">
    <!-- ── Form Card ─────────────────────────────────────────── -->
    <mat-card class="form-card anim-fade-in-up">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <!-- Section: Personal Information -->
          <div class="section-header">
            <div class="section-icon"><mat-icon>person_outline</mat-icon></div>
            <h3 class="section-title">Personal Information</h3>
          </div>
          <div class="form-grid" [class.single-col]="isMobile">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="name" placeholder="e.g. Priya Sharma" autocomplete="name">
              <mat-icon matSuffix>badge</mat-icon>
              <mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error>
              <mat-error *ngIf="form.get('name')?.hasError('minlength')">Minimum 2 characters</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email" placeholder="priya@example.com" autocomplete="email">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="form.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="form.get('email')?.hasError('email')">Enter a valid email address</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mobile Number</mat-label>
              <input matInput type="tel" formControlName="mobileNumber" placeholder="9876543210" autocomplete="tel">
              <mat-icon matSuffix>phone</mat-icon>
              <mat-error *ngIf="form.get('mobileNumber')?.hasError('required')">Mobile is required</mat-error>
              <mat-error *ngIf="form.get('mobileNumber')?.hasError('pattern')">Valid 10-digit Indian mobile (starts 6–9)</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Date of Joining</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="dateOfJoining">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="form.get('dateOfJoining')?.hasError('required')">Date of joining is required</mat-error>
            </mat-form-field>
            <!-- ONLY CHANGE: Assign to Batch moved here from Program Details -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Assign to Batch</mat-label>
              <mat-select formControlName="batchId">
                <mat-option value="">— Select a batch —</mat-option>
                <mat-option *ngFor="let b of batches" [value]="b.id">
                  {{ b.batchName }}
                  <span class="batch-dates"> · {{ b.startDate | date:'MMM d' }} – {{ b.endDate | date:'MMM d, yyyy' }}</span>
                </mat-option>
              </mat-select>
              <mat-icon matSuffix>groups</mat-icon>
              <mat-error *ngIf="form.get('batchId')?.hasError('required')">Please assign a batch</mat-error>
            </mat-form-field>
          </div>
          <!-- Section: Program Details -->
          <div class="section-header" style="margin-top:1.75rem">
            <div class="section-icon"><mat-icon>work_outline</mat-icon></div>
            <h3 class="section-title">Program Details</h3>
          </div>
          <div class="form-grid" [class.single-col]="isMobile">
            <!-- ID Card Type -->
            <div class="full-width">
              <label class="field-label">ID Card Type *</label>
              <mat-radio-group formControlName="idCardType" class="card-type-group" [class.stacked]="isMobile">
                <div class="card-option" [class.selected]="form.value.idCardType === 'FREE'"
                     (click)="form.get('idCardType')?.setValue('FREE')" role="button" tabindex="0">
                  <mat-radio-button value="FREE">
                    <div class="card-option-content">
                      <div class="card-type-icon free"><mat-icon>credit_card</mat-icon></div>
                      <div>
                        <div class="card-type-name">Free</div>
                        <div class="card-type-prefix">TDA&#123;YYYYMMDD&#125;-001</div>
                      </div>
                    </div>
                  </mat-radio-button>
                </div>
                <div class="card-option" [class.selected]="form.value.idCardType === 'PREMIUM'"
                     (click)="form.get('idCardType')?.setValue('PREMIUM')" role="button" tabindex="0">
                  <mat-radio-button value="PREMIUM">
                    <div class="card-option-content">
                      <div class="card-type-icon premium"><mat-icon>workspace_premium</mat-icon></div>
                      <div>
                        <div class="card-type-name">Premium</div>
                        <div class="card-type-prefix">EMP&#123;YYYYMMDD&#125;-001</div>
                      </div>
                    </div>
                  </mat-radio-button>
                </div>
              </mat-radio-group>
            </div>
            <!-- Edit-only: performance fields -->
            <ng-container *ngIf="isEdit">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Performance Score (0–100)</mat-label>
                <input matInput type="number" formControlName="performanceScore" min="0" max="100">
                <mat-icon matSuffix>insights</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Performance Remarks</mat-label>
                <textarea matInput formControlName="performanceRemarks" rows="3"
                          placeholder="e.g. Excellent progress in Q3…"></textarea>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="ACTIVE">Active</mat-option>
                  <mat-option value="COMPLETED">Completed</mat-option>
                  <mat-option value="TERMINATED">Terminated</mat-option>
                </mat-select>
              </mat-form-field>
            </ng-container>
          </div>
          <!-- ID Format Preview -->
          <div class="id-preview" *ngIf="idFormatPreview">
            <div class="id-preview-left">
              <span class="id-preview-label">ID Format Preview</span>
              <span class="id-preview-value">{{ idFormatPreview }}</span>
            </div>
            <span class="id-preview-hint">Sequence assigned on save</span>
          </div>
          <!-- Actions -->
          <mat-divider style="margin:1.5rem 0"></mat-divider>
          <div class="form-actions" [class.stacked]="isMobile">
            <a routerLink="/interns" mat-stroked-button class="cancel-btn">Cancel</a>
            <button mat-raised-button color="primary" type="submit" [disabled]="submitting" class="submit-btn">
              <mat-spinner *ngIf="submitting" diameter="18" style="margin-right:8px"></mat-spinner>
              {{ submitting ? 'Saving…' : (isEdit ? 'Update Intern' : 'Register Intern') }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
    <!-- ── ID Card Preview (hidden on mobile) ──────────────────── -->
    <div class="preview-panel anim-fade-in-up" *ngIf="!isMobile">
      <p class="preview-title">ID Card Preview</p>
      <div class="id-card" [class.premium]="form.value.idCardType === 'PREMIUM'">
        <div class="id-card-header">
          <div class="id-card-brand">InternHub</div>
          <div class="id-card-type">{{ form.value.idCardType || 'FREE' }}</div>
        </div>
        <div class="id-card-avatar">{{ (form.value.name || '?').charAt(0).toUpperCase() }}</div>
        <div class="id-card-name">{{ form.value.name || 'Full Name' }}</div>
        <div class="id-card-email">{{ form.value.email || 'email@example.com' }}</div>
        <div class="id-card-divider"></div>
        <div class="id-card-row">
          <div class="id-card-info">
            <div class="id-card-info-label">Intern ID</div>
            <div class="id-card-info-value mono">{{ idFormatPreview || 'TDA-AUTO' }}</div>
          </div>
          <div class="id-card-info">
            <div class="id-card-info-label">Batch</div>
            <div class="id-card-info-value">{{ selectedBatchName || '—' }}</div>
          </div>
        </div>
        <div class="id-card-row" style="margin-top:.5rem">
          <div class="id-card-info">
            <div class="id-card-info-label">Mobile</div>
            <div class="id-card-info-value mono">{{ form.value.mobileNumber || '—' }}</div>
          </div>
          <div class="id-card-info">
            <div class="id-card-info-label">Joining</div>
            <div class="id-card-info-value">{{ form.value.dateOfJoining | date:'MMM d, yyyy' }}</div>
          </div>
        </div>
        <div class="id-card-barcode">
          <div *ngFor="let b of barcodeBars" class="bar" [style.height.px]="b"></div>
        </div>
      </div>
      <!-- Mini hint card below ID card -->
      <div class="hint-card" *ngIf="idFormatPreview">
        <mat-icon style="font-size:16px;width:16px;height:16px;color:#6366f1">info_outline</mat-icon>
        <span>ID will be finalized on save with a unique sequence number.</span>
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
    /* ── Layout ─────────────────────────────────────────────────────────── */
    .form-layout { display:grid; grid-template-columns:1fr 320px; gap:1.75rem; align-items:start; }
    .form-layout.mobile { grid-template-columns:1fr; }
    /* ── Form Card ──────────────────────────────────────────────────────── */
    .form-card { border-radius:16px !important; }
    /* ── Section Header ─────────────────────────────────────────────────── */
    .section-header { display:flex; align-items:center; gap:.625rem; margin-bottom:1.25rem; }
    .section-icon { width:32px; height:32px; border-radius:8px; background:rgba(99,102,241,.12); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .section-icon mat-icon { font-size:18px; width:18px; height:18px; color:#6366f1; }
    .section-title { font-size:.75rem; font-weight:600; text-transform:uppercase; letter-spacing:.09em; color:#94a3b8; margin:0; }
    /* ── Form Grid ──────────────────────────────────────────────────────── */
    .form-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:1rem; }
    .form-grid.single-col { grid-template-columns:1fr; }
    .full-width { width:100%; }
    .field-label { font-size:.8rem; font-weight:500; color:#94a3b8; display:block; margin-bottom:.625rem; }
    /* ── Card Type Options ──────────────────────────────────────────────── */
    .card-type-group { display:flex; gap:.75rem; }
    .card-type-group.stacked { flex-direction:column; }
    .card-option {
      flex:1; cursor:pointer;
      border:2px solid rgba(148,163,184,.15) !important;
      border-radius:12px;
      padding:.75rem 1rem;
      transition:all .2s ease;
      background:rgba(30,41,59,.5);
    }
    .card-option:hover { border-color:rgba(99,102,241,.4) !important; background:rgba(99,102,241,.06) !important; }
    .card-option.selected { border-color:#6366f1 !important; background:rgba(99,102,241,.1) !important; }
    .card-option-content { display:flex; align-items:center; gap:.875rem; }
    .card-type-icon { width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .card-type-icon.free    { background:rgba(6,182,212,.12); color:#06b6d4; }
    .card-type-icon.premium { background:rgba(245,158,11,.12); color:#f59e0b; }
    .card-type-icon mat-icon { font-size:18px; width:18px; height:18px; }
    .card-type-name { font-weight:600; font-size:.875rem; color:#e2e8f0; }
    .card-type-prefix { font-size:.68rem; color:#64748b; font-family:monospace; margin-top:1px; }
    /* ── Batch dates hint ───────────────────────────────────────────────── */
    .batch-dates { font-size:.78rem; color:#64748b; }
    /* ── ID Preview ─────────────────────────────────────────────────────── */
    .id-preview {
      display:flex; align-items:center; justify-content:space-between;
      background:rgba(99,102,241,.07);
      border:1px dashed rgba(99,102,241,.35);
      border-radius:10px; padding:1rem 1.25rem;
      margin:1.5rem 0; flex-wrap:wrap; gap:.5rem;
    }
    .id-preview-left { display:flex; flex-direction:column; gap:3px; }
    .id-preview-label { font-size:.68rem; text-transform:uppercase; letter-spacing:.09em; color:#64748b; }
    .id-preview-value { font-family:monospace; font-size:1rem; font-weight:700; color:#818cf8; }
    .id-preview-hint { font-size:.72rem; color:#64748b; font-style:italic; }
    /* ── Actions ────────────────────────────────────────────────────────── */
    .form-actions { display:flex; justify-content:flex-end; gap:.75rem; align-items:center; }
    .form-actions.stacked { flex-direction:column-reverse; }
    .form-actions.stacked .cancel-btn,
    .form-actions.stacked .submit-btn { width:100%; justify-content:center; }
    .btn-label { margin-left:4px; }
    /* ── ID Card Preview ────────────────────────────────────────────────── */
    .preview-panel { position:sticky; top:80px; }
    .preview-title { font-size:.72rem; text-transform:uppercase; letter-spacing:.09em; color:#64748b; margin:0 0 .875rem; font-weight:600; }
    .id-card {
      background:linear-gradient(145deg,#0f172a,#1e293b);
      border:1px solid rgba(56,189,248,.2);
      border-radius:16px; padding:1.5rem;
      box-shadow:0 20px 60px rgba(0,0,0,.4);
    }
    .id-card.premium { background:linear-gradient(145deg,#1a0a2e,#2d1b4e); border-color:rgba(129,140,248,.3); }
    .id-card-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }
    .id-card-brand { font-size:.75rem; font-weight:700; color:#38bdf8; letter-spacing:.09em; text-transform:uppercase; }
    .id-card.premium .id-card-brand { color:#818cf8; }
    .id-card-type { font-size:.62rem; padding:.15rem .5rem; border-radius:999px; background:rgba(56,189,248,.15); color:#38bdf8; font-weight:600; }
    .id-card.premium .id-card-type { background:rgba(129,140,248,.15); color:#818cf8; }
    .id-card-avatar { width:52px; height:52px; border-radius:50%; background:linear-gradient(135deg,#6366f1,#a855f7); color:#fff; display:flex; align-items:center; justify-content:center; font-size:1.3rem; font-weight:700; margin:0 auto .625rem; }
    .id-card-name { text-align:center; font-weight:700; color:#fff; margin-bottom:.15rem; font-size:.95rem; }
    .id-card-email { text-align:center; font-size:.7rem; color:#94a3b8; margin-bottom:.875rem; }
    .id-card-divider { height:1px; background:rgba(255,255,255,.08); margin:.625rem 0; }
    .id-card-row { display:grid; grid-template-columns:1fr 1fr; gap:.875rem; }
    .id-card-info-label { font-size:.6rem; text-transform:uppercase; letter-spacing:.09em; color:#475569; margin-bottom:.1rem; }
    .id-card-info-value { font-size:.75rem; font-weight:600; color:#e2e8f0; }
    .id-card-info-value.mono { font-family:monospace; color:#38bdf8; }
    .id-card.premium .id-card-info-value.mono { color:#818cf8; }
    .id-card-barcode { display:flex; gap:2px; align-items:flex-end; margin-top:1.125rem; height:24px; }
    .id-card-barcode .bar { width:2px; background:rgba(56,189,248,.35); border-radius:1px; }
    .id-card.premium .id-card-barcode .bar { background:rgba(129,140,248,.35); }
    /* ── Hint card below ID card preview ────────────────────────────────── */
    .hint-card { display:flex; align-items:flex-start; gap:.5rem; margin-top:.875rem; padding:.75rem 1rem; background:rgba(99,102,241,.07); border:1px solid rgba(99,102,241,.2); border-radius:10px; font-size:.75rem; color:#94a3b8; line-height:1.5; }
    /* ── Responsive overrides ───────────────────────────────────────────── */
    @media (max-width: 1024px) {
      .page-container { padding: 1.5rem; }
    }
    @media (max-width: 768px) {
      .page-container { padding: 1rem; }
      .page-header { flex-direction:column; align-items:flex-start; }
      .form-layout { grid-template-columns:1fr !important; }
      .form-grid { grid-template-columns:1fr !important; }
    }
    @media (max-width: 480px) {
      .page-title { font-size:1.25rem; }
      .btn-label { display:none; }
    }
    /* ── Animations ─────────────────────────────────────────────────────── */
    .anim-fade-in { animation:fadeIn .4s ease both; }
    .anim-fade-in-up { animation:fadeInUp .45s ease both; }
    @keyframes fadeIn    { from{opacity:0}              to{opacity:1} }
    @keyframes fadeInUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  `]
})
export class InternFormComponent implements OnInit {
  private fb            = inject(FormBuilder);
  private internService = inject(InternService);
  private batchService  = inject(BatchService);
  private snack         = inject(MatSnackBar);
  private router        = inject(Router);
  private route         = inject(ActivatedRoute);
  private bp            = inject(BreakpointObserver);
  isEdit    = false;
  editId?:   number;
  submitting = false;
  isMobile   = false;
  batches:   BatchSummary[] = [];
  barcodeBars = Array.from({ length: 30 }, () => Math.random() * 16 + 6);
  form = this.fb.group({
    name:               ['', [Validators.required, Validators.minLength(2)]],
    email:              ['', [Validators.required, Validators.email]],
    mobileNumber:       ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    idCardType:         ['FREE', Validators.required],
    dateOfJoining:      [null as Date | null, Validators.required],
    batchId:            ['', Validators.required],
    performanceScore:   [null as number | null],
    performanceRemarks: [''],
    status:             ['ACTIVE']
  });
  get idFormatPreview(): string {
    const type = this.form.value.idCardType;
    const date = this.form.value.dateOfJoining;
    if (!type || !date) return '';
    const prefix = type === 'PREMIUM' ? 'EMP' : 'TDA';
    const d = date instanceof Date ? date : new Date(date as string);
    const datePart = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    return `${prefix}${datePart}-###`;
  }
  get selectedBatchName(): string {
    const id = this.form.value.batchId;
    return this.batches.find(b => b.id === +id!)?.batchName ?? '';
  }
  ngOnInit(): void {
    this.bp.observe([Breakpoints.XSmall, Breakpoints.Small]).subscribe(result => {
      this.isMobile = result.matches;
    });
    this.batchService.getSummaries().subscribe(b => this.batches = b);
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.editId = +id;
      this.internService.getById(this.editId).subscribe(intern => {
        this.form.patchValue({
          name:               intern.name,
          email:              intern.email,
          mobileNumber:       intern.mobileNumber,
          idCardType:         intern.idCardType,
          dateOfJoining:      intern.dateOfJoining ? new Date(intern.dateOfJoining) : null,
          batchId:            intern.batchId.toString(),
          performanceScore:   intern.performanceScore ?? null,
          performanceRemarks: intern.performanceRemarks ?? '',
          status:             intern.status
        });
        this.form.get('idCardType')?.disable();
        this.form.get('dateOfJoining')?.disable();
      });
    }
  }
  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const v = this.form.getRawValue();
    const dateVal = v.dateOfJoining;
    let dateStr = '';
    if (dateVal instanceof Date) {
      dateStr = `${dateVal.getFullYear()}-${String(dateVal.getMonth() + 1).padStart(2, '0')}-${String(dateVal.getDate()).padStart(2, '0')}`;
    } else {
      dateStr = dateVal as unknown as string;
    }
    if (this.isEdit) {
      this.internService.update(this.editId!, {
        name: v.name!, email: v.email!, mobileNumber: v.mobileNumber!,
        status: v.status as any, batchId: +v.batchId!,
        performanceScore:   v.performanceScore   ?? undefined,
        performanceRemarks: v.performanceRemarks ?? undefined
      }).subscribe({
        next:  () => { this.snack.open('Intern updated!', 'OK', { duration: 3000 }); this.router.navigate(['/interns']); },
        error: (e) => { this.snack.open(e.error?.message ?? 'Update failed', 'OK', { duration: 3000 }); this.submitting = false; }
      });
    } else {
      this.internService.create({
        name: v.name!, email: v.email!, mobileNumber: v.mobileNumber!,
        idCardType: v.idCardType as any, dateOfJoining: dateStr, batchId: +v.batchId!
      }).subscribe({
        next:  (intern) => { this.snack.open(`Intern registered! ID: ${intern.internId}`, 'OK', { duration: 4000 }); this.router.navigate(['/interns']); },
        error: (e) => { this.snack.open(e.error?.message ?? 'Registration failed', 'OK', { duration: 3000 }); this.submitting = false; }
      });
    }
  }
}