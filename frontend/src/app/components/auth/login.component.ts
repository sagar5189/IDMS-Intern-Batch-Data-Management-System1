// login.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
<div class="login-wrap">

  <!-- Animated background -->
  <div class="bg-mesh">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
    <div class="grid-lines"></div>
  </div>

  <!-- Card -->
  <div class="login-card anim-scale-in">

    <!-- Brand -->
    <div class="login-brand">
      <div class="login-logo">
        <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
          <path d="M14 2L25.26 8.5V21.5L14 28L2.74 21.5V8.5L14 2Z" fill="url(#g1)"/>
          <path d="M14 7L20.5 10.75V18.25L14 22L7.5 18.25V10.75L14 7Z"
                fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
          <defs>
            <linearGradient id="g1" x1="2.74" y1="2" x2="25.26" y2="28">
              <stop offset="0%" stop-color="#38bdf8"/>
              <stop offset="100%" stop-color="#818cf8"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div>
        <div class="login-brand-name">InternHub</div>
        <div class="login-brand-sub">Management System</div>
      </div>
    </div>

    <div class="login-divider"></div>

    <h2 class="login-title">Welcome back</h2>
    <p class="login-subtitle">Sign in to your account to continue</p>

    <form [formGroup]="form" (ngSubmit)="submit()" class="login-form">

      <div class="form-field">
        <label>Username</label>
        <div class="input-wrap" [class.focused]="userFocused" [class.error-border]="isInvalid('username')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <input type="text" formControlName="username" placeholder="Enter username"
                 (focus)="userFocused=true" (blur)="userFocused=false">
        </div>
        <span class="error-msg" *ngIf="isInvalid('username')">Username is required</span>
      </div>

      <div class="form-field">
        <label>Password</label>
        <div class="input-wrap" [class.focused]="passFocused" [class.error-border]="isInvalid('password')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input [type]="showPass ? 'text' : 'password'" formControlName="password"
                 placeholder="Enter password"
                 (focus)="passFocused=true" (blur)="passFocused=false">
          <button type="button" class="toggle-pass" (click)="showPass = !showPass">
            <svg *ngIf="!showPass" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            <svg *ngIf="showPass" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          </button>
        </div>
        <span class="error-msg" *ngIf="isInvalid('password')">Password is required</span>
      </div>

      <div class="error-banner" *ngIf="loginError">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ loginError }}
      </div>

      <button type="submit" class="btn-login" [disabled]="submitting">
        <div class="btn-login-inner">
          <svg *ngIf="submitting" class="spin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
          </svg>
          <svg *ngIf="!submitting" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          {{ submitting ? 'Signing in…' : 'Sign In' }}
        </div>
      </button>
    </form>

    <!-- Demo credentials -->
    <div class="demo-creds">
      <div class="demo-title">Demo Credentials</div>
      <div class="demo-row">
        <button class="demo-btn" (click)="fillCreds('admin','admin123')">
          <span class="demo-role admin">Admin</span>
          <span class="demo-cred">admin / admin123</span>
        </button>
        <button class="demo-btn" (click)="fillCreds('manager','mgr123')">
          <span class="demo-role manager">Manager</span>
          <span class="demo-cred">manager / mgr123</span>
        </button>
      </div>
    </div>

    <div class="login-footer">
      <div class="login-footer-dot"></div>
      <span>Secure • Role-based • JWT Auth</span>
      <div class="login-footer-dot"></div>
    </div>
  </div>
</div>
  `,
  styles: [`
    :host { display: block; }

    /* ── Background ── */
    .login-wrap {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: var(--bg-void);
      padding: 1rem;
      position: relative; overflow: hidden;
    }
    .bg-mesh { position:fixed; inset:0; z-index:0; }
    .orb {
      position: absolute; border-radius: 50%;
      filter: blur(80px); opacity: 0.35;
      animation: float 8s ease-in-out infinite;
    }
    .orb-1 {
      width:500px; height:500px; background:#38bdf8;
      top:-200px; left:-150px; animation-delay:0s;
    }
    .orb-2 {
      width:400px; height:400px; background:#818cf8;
      bottom:-150px; right:-100px; animation-delay:3s;
    }
    .orb-3 {
      width:300px; height:300px; background:#34d399;
      top:50%; left:60%; animation-delay:5s; opacity:0.2;
    }
    .grid-lines {
      position:absolute; inset:0;
      background-image:
        linear-gradient(rgba(99,120,180,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,120,180,0.06) 1px, transparent 1px);
      background-size: 50px 50px;
    }

    /* ── Card ── */
    .login-card {
      position: relative; z-index: 1;
      width: 100%; max-width: 440px;
      background: rgba(10, 15, 30, 0.85);
      border: 1px solid rgba(99,120,180,0.2);
      border-radius: 24px;
      padding: 2.5rem;
      backdrop-filter: blur(20px);
      box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(56,189,248,0.08);
    }

    /* Brand */
    .login-brand { display:flex; align-items:center; gap:1rem; margin-bottom:1.75rem; }
    .login-logo {
      width:56px; height:56px; border-radius:14px;
      background:linear-gradient(135deg, rgba(56,189,248,0.12), rgba(129,140,248,0.12));
      border:1px solid rgba(56,189,248,0.2);
      display:flex; align-items:center; justify-content:center;
      animation: float 4s ease-in-out infinite;
    }
    .login-brand-name { font-size:1.3rem; font-weight:800; letter-spacing:-0.02em; }
    .login-brand-sub  { font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; }

    .login-divider { height:1px; background:var(--border-subtle); margin:0 0 1.75rem; }

    .login-title    { font-size:1.5rem; font-weight:700; margin-bottom:0.35rem; }
    .login-subtitle { font-size:0.875rem; color:var(--text-secondary); margin-bottom:1.75rem; }

    /* Form */
    .login-form { display:flex; flex-direction:column; gap:1.1rem; }

    .form-field { display:flex; flex-direction:column; gap:0.4rem; }
    .form-field label { font-size:0.78rem; font-weight:600; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.07em; }

    .input-wrap {
      display:flex; align-items:center; gap:0.65rem;
      background:rgba(255,255,255,0.04); border:1px solid var(--border-subtle);
      border-radius:10px; padding:0.7rem 1rem;
      transition:all var(--transition);
    }
    .input-wrap.focused { border-color:var(--accent-blue); box-shadow:0 0 0 3px rgba(56,189,248,0.1); }
    .input-wrap.error-border { border-color:var(--accent-rose); box-shadow:0 0 0 3px rgba(248,113,113,0.1); }
    .input-wrap svg { color:var(--text-muted); flex-shrink:0; }
    .input-wrap input { background:none; border:none; outline:none; color:var(--text-primary); font-family:var(--font-sans); font-size:0.95rem; flex:1; }
    .input-wrap input::placeholder { color:var(--text-muted); }
    .toggle-pass { background:none; border:none; cursor:pointer; color:var(--text-muted); display:flex; padding:2px; transition:color var(--transition); }
    .toggle-pass:hover { color:var(--text-primary); }

    .error-msg { font-size:0.77rem; color:var(--accent-rose); }

    .error-banner {
      display:flex; align-items:center; gap:0.5rem;
      background:rgba(248,113,113,0.08); border:1px solid rgba(248,113,113,0.25);
      border-radius:8px; padding:0.65rem 1rem;
      color:var(--accent-rose); font-size:0.85rem;
      animation:fadeIn 0.3s;
    }

    /* Submit button */
    .btn-login {
      width:100%; padding:0.8rem;
      background:linear-gradient(135deg, #38bdf8, #818cf8);
      border:none; border-radius:10px; cursor:pointer;
      font-family:var(--font-sans); font-weight:700;
      color:var(--bg-void); font-size:0.95rem;
      transition:all var(--transition-spring);
      box-shadow:0 0 30px rgba(56,189,248,0.25);
      margin-top:0.5rem;
    }
    .btn-login:hover { transform:translateY(-2px); box-shadow:0 0 40px rgba(56,189,248,0.4); }
    .btn-login:active { transform:scale(0.98); }
    .btn-login:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
    .btn-login-inner { display:flex; align-items:center; justify-content:center; gap:0.5rem; }
    .spin-icon { animation:spin 0.8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }

    /* Demo creds */
    .demo-creds { margin-top:1.5rem; }
    .demo-title { font-size:0.7rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--text-muted); text-align:center; margin-bottom:0.75rem; }
    .demo-row { display:flex; gap:0.75rem; }
    .demo-btn {
      flex:1; display:flex; flex-direction:column; gap:0.3rem; align-items:center;
      padding:0.65rem; border-radius:10px;
      background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle);
      cursor:pointer; transition:all var(--transition);
    }
    .demo-btn:hover { border-color:var(--border-glow); background:rgba(56,189,248,0.05); }
    .demo-role { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; padding:0.1rem 0.5rem; border-radius:999px; }
    .demo-role.admin   { background:rgba(56,189,248,0.15); color:var(--accent-blue); }
    .demo-role.manager { background:rgba(52,211,153,0.15); color:var(--accent-emerald); }
    .demo-cred { font-size:0.72rem; color:var(--text-secondary); font-family:var(--font-mono); }

    /* Footer */
    .login-footer { display:flex; align-items:center; justify-content:center; gap:0.5rem; margin-top:1.5rem; font-size:0.72rem; color:var(--text-muted); }
    .login-footer-dot { width:4px; height:4px; border-radius:50%; background:var(--text-muted); opacity:0.5; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  submitting = false;
  showPass = false;
  loginError = '';
  userFocused = false;
  passFocused = false;

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  isInvalid(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && c?.touched);
  }

  fillCreds(u: string, p: string) {
    this.form.patchValue({ username: u, password: p });
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    this.loginError = '';
    const { username, password } = this.form.value;

    this.auth.login({ username: username!, password: password! }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.loginError = 'Invalid username or password. Try the demo credentials below.';
        this.submitting = false;
      }
    });
  }
}
