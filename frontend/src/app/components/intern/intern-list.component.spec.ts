import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { InternListComponent } from './intern-list.component';
import { InternService } from '../../services/intern.service';
import { BatchService } from '../../services/batch.service';
import { AuthService } from '../../services/auth.service';
import { Intern, BatchSummary } from '../../models/models';

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeIntern(overrides: Partial<Intern> = {}): Intern {
  return {
    id: 1, internId: 'EMP20241129-001', name: 'Priya Sharma',
    email: 'priya@example.com', mobileNumber: '9876543210',
    idCardType: 'PREMIUM', dateOfJoining: '2024-11-29',
    batchName: 'Batch A', batchId: 1, status: 'ACTIVE',
    ...overrides
  };
}

const mockBatches: BatchSummary[] = [
  { id: 1, batchName: 'Batch A', startDate: '2024-11-01', endDate: '2025-05-01', status: 'ACTIVE', totalInterns: 5 },
  { id: 2, batchName: 'Batch B', startDate: '2025-01-01', endDate: '2025-07-01', status: 'UPCOMING', totalInterns: 0 }
];

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('InternListComponent', () => {
  let component: InternListComponent;
  let fixture: ComponentFixture<InternListComponent>;
  let internServiceSpy: jasmine.SpyObj<InternService>;
  let batchServiceSpy: jasmine.SpyObj<BatchService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const internList: Intern[] = [
    makeIntern({ id: 1, internId: 'EMP20241129-001', name: 'Priya Sharma', idCardType: 'PREMIUM', batchId: 1, status: 'ACTIVE' }),
    makeIntern({ id: 2, internId: 'TDA20241129-001', name: 'Ravi Kumar',   idCardType: 'FREE',    batchId: 2, status: 'COMPLETED', email: 'ravi@example.com' }),
    makeIntern({ id: 3, internId: 'EMP20241130-001', name: 'Sneha Patel',  idCardType: 'PREMIUM', batchId: 1, status: 'ACTIVE',    email: 'sneha@example.com' }),
  ];

  beforeEach(async () => {
    internServiceSpy = jasmine.createSpyObj('InternService', ['getAll', 'delete']);
    batchServiceSpy  = jasmine.createSpyObj('BatchService',  ['getSummaries']);
    authServiceSpy   = jasmine.createSpyObj('AuthService',   ['hasRole', 'hasAnyRole']);

    internServiceSpy.getAll.and.returnValue(of(internList));
    batchServiceSpy.getSummaries.and.returnValue(of(mockBatches));
    authServiceSpy.hasRole.and.returnValue(true);
    authServiceSpy.hasAnyRole.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [
        InternListComponent,
        RouterTestingModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        MatSnackBarModule
      ],
      providers: [
        { provide: InternService, useValue: internServiceSpy },
        { provide: BatchService,  useValue: batchServiceSpy },
        { provide: AuthService,   useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InternListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Rendering ────────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all interns on init', () => {
    expect(internServiceSpy.getAll).toHaveBeenCalledTimes(1);
    expect(component.allInterns.length).toBe(3);
    expect(component.loading).toBeFalse();
  });

  it('should load batch summaries on init', () => {
    expect(batchServiceSpy.getSummaries).toHaveBeenCalledTimes(1);
    expect(component.batches.length).toBe(2);
  });

  // ── Filtering ────────────────────────────────────────────────────────────────

  it('should show all interns when no filter applied', () => {
    expect(component.dataSource.data.length).toBe(3);
  });

  it('should filter by name (case-insensitive)', () => {
    component.searchName = 'priya';
    component.applyFilters();
    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].name).toBe('Priya Sharma');
  });

  it('should filter by intern ID', () => {
    component.searchName = 'TDA';
    component.applyFilters();
    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].internId).toBe('TDA20241129-001');
  });

  it('should filter by batch', () => {
    component.filterBatch = 1;
    component.applyFilters();
    expect(component.dataSource.data.length).toBe(2);
    component.dataSource.data.forEach(i => expect(i.batchId).toBe(1));
  });

  it('should filter by ID card type', () => {
    component.filterType = 'FREE';
    component.applyFilters();
    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].idCardType).toBe('FREE');
  });

  it('should filter by status', () => {
    component.filterStatus = 'COMPLETED';
    component.applyFilters();
    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].status).toBe('COMPLETED');
  });

  it('should combine multiple filters', () => {
    component.filterBatch = 1;
    component.filterType  = 'PREMIUM';
    component.applyFilters();
    expect(component.dataSource.data.length).toBe(2);
  });

  it('should return all interns after clearFilters()', () => {
    component.searchName  = 'priya';
    component.filterType  = 'PREMIUM';
    component.applyFilters();
    expect(component.dataSource.data.length).toBe(1);

    component.clearFilters();
    expect(component.dataSource.data.length).toBe(3);
    expect(component.searchName).toBe('');
    expect(component.filterType).toBe('');
  });

  it('hasFilters should be true when any filter is active', () => {
    component.searchName = 'x';
    expect(component.hasFilters).toBeTruthy();
  });

  it('hasFilters should be falsy when all filters are cleared', () => {
    component.searchName  = '';
    component.filterBatch = '';
    component.filterType  = '';
    component.filterStatus = '';
    expect(component.hasFilters).toBeFalsy();
  });

  // ── Delete ───────────────────────────────────────────────────────────────────

  it('should set deleteTarget when confirmDelete is called', () => {
    const target = internList[0];
    component.confirmDelete(target);
    expect(component.deleteTarget).toBe(target);
  });

  it('should clear deleteTarget on successful delete', fakeAsync(() => {
    internServiceSpy.delete.and.returnValue(of({ message: 'deleted' }));
    component.deleteTarget = internList[0];
    component.doDelete();
    tick();
    expect(component.deleteTarget).toBeNull();
    expect(component.allInterns.length).toBe(2);
  }));

  it('should handle delete error gracefully', fakeAsync(() => {
    internServiceSpy.delete.and.returnValue(throwError(() => new Error('Server error')));
    component.deleteTarget = internList[0];
    component.doDelete();
    tick();
    // allInterns unchanged
    expect(component.allInterns.length).toBe(3);
  }));

  // ── Role-based access ─────────────────────────────────────────────────────────

  it('canEdit should return true for ADMIN/MANAGER', () => {
    authServiceSpy.hasAnyRole.and.returnValue(true);
    expect(component.canEdit).toBeTrue();
  });

  it('canDelete should return true for ADMIN', () => {
    authServiceSpy.hasRole.and.returnValue(true);
    expect(component.canDelete).toBeTrue();
  });

  it('canEdit should return false for VIEWER', () => {
    authServiceSpy.hasAnyRole.and.returnValue(false);
    expect(component.canEdit).toBeFalse();
  });

  // ── API call ──────────────────────────────────────────────────────────────────

  it('should call InternService.getAll exactly once on init', () => {
    expect(internServiceSpy.getAll).toHaveBeenCalledTimes(1);
  });

  it('should handle API error on load gracefully', async () => {
    internServiceSpy.getAll.and.returnValue(throwError(() => new Error('Network error')));

    const fixture2 = TestBed.createComponent(InternListComponent);
    const comp2 = fixture2.componentInstance;
    fixture2.detectChanges();
    await fixture2.whenStable();

    expect(comp2.loading).toBeFalse();
    expect(comp2.allInterns.length).toBe(0);
  });
});
