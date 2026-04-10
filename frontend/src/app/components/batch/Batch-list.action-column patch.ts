// ─────────────────────────────────────────────────────────────────────────────
// ISSUE 3 FIX — batch-list.component.ts  ACTION COLUMN PATCH
//
// INSTRUCTION: In batch-list.component.ts, find the <!-- Actions --> section
// inside the template (around line 183) and REPLACE the existing
// <ng-container matColumnDef="actions"> block with the block below.
//
// NOTHING else in batch-list.component.ts should be changed.
// All existing logic (delete, expand, filter, etc.) is preserved exactly.
// The only addition is one mat-icon-button that navigates to /batches/edit/:id.
// ─────────────────────────────────────────────────────────────────────────────

/*  FIND this exact block in the template:

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

  REPLACE it with:
*/

// ── REPLACEMENT BLOCK (copy this into the template) ──────────────────────────

`
          <!-- Actions -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let b">
              <a [routerLink]="['/batches', b.id, 'overview']"
                 mat-icon-button color="primary" matTooltip="Full Overview">
                <mat-icon>open_in_new</mat-icon>
              </a>
              <!-- ISSUE 3 FIX: Edit button — navigates to /batches/edit/:id -->
              <a [routerLink]="['/batches/edit', b.id]"
                 mat-icon-button color="accent" matTooltip="Edit Batch"
                 *ngIf="canEdit">
                <mat-icon>edit</mat-icon>
              </a>
              <!-- END FIX -->
              <button mat-icon-button color="warn" matTooltip="Delete batch"
                      (click)="confirmDelete(b)" *ngIf="canDelete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
`

// ─────────────────────────────────────────────────────────────────────────────
// Note: canEdit is already defined in the component class as:
//   get canEdit() { return this.auth.hasAnyRole(['ADMIN', 'MANAGER']); }
// No class-level change needed.
//
// MatIconModule is already imported in the component's imports array.
// RouterModule is already imported in the component's imports array.
// No new imports are needed.
// ─────────────────────────────────────────────────────────────────────────────