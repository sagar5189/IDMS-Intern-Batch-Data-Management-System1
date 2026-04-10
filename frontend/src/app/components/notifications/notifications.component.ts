// notifications.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Notification {
  id: number;
  type: 'intern_registered' | 'batch_created' | 'performance_updated' | 'batch_completed';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="page-container anim-fade-in">
  <div class="page-header">
    <div>
      <h1 class="page-title">Notifications</h1>
      <p class="page-subtitle">{{ unreadCount }} unread notifications</p>
    </div>
    <button class="btn-secondary" (click)="markAllRead()" *ngIf="unreadCount > 0">
      Mark all read
    </button>
  </div>

  <!-- Filter tabs -->
  <div class="notif-tabs">
    <button class="tab" [class.active]="filter==='all'" (click)="filter='all'">All <span class="tab-count">{{ notifications.length }}</span></button>
    <button class="tab" [class.active]="filter==='unread'" (click)="filter='unread'">Unread <span class="tab-count">{{ unreadCount }}</span></button>
    <button class="tab" [class.active]="filter==='intern'" (click)="filter='intern'">Interns</button>
    <button class="tab" [class.active]="filter==='batch'" (click)="filter='batch'">Batches</button>
  </div>

  <!-- Notifications list -->
  <div class="notif-list glass-card">
    <div *ngFor="let notif of filteredNotifications; let i = index"
         class="notif-item anim-fade-in-up"
         [class.unread]="!notif.read"
         [style.animation-delay]="(i * 0.05) + 's'"
         (click)="markRead(notif)">

      <div class="notif-icon" [class]="getIconClass(notif.type)">
        <svg *ngIf="notif.type==='intern_registered'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
        </svg>
        <svg *ngIf="notif.type==='batch_created'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
        <svg *ngIf="notif.type==='performance_updated'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <svg *ngIf="notif.type==='batch_completed'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <div class="notif-content">
        <div class="notif-title">{{ notif.title }}</div>
        <div class="notif-message">{{ notif.message }}</div>
        <div class="notif-time">{{ notif.time }}</div>
      </div>

      <div class="notif-unread-dot" *ngIf="!notif.read"></div>
    </div>

    <div *ngIf="filteredNotifications.length === 0" class="empty-notif">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <p>No notifications here</p>
    </div>
  </div>
</div>
  `,
  styles: [`
    .notif-tabs { display:flex; gap:0.5rem; margin-bottom:1.25rem; flex-wrap:wrap; }
    .tab { background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:0.45rem 1rem; font-family:var(--font-sans); font-size:0.82rem; font-weight:500; color:var(--text-secondary); cursor:pointer; display:flex; align-items:center; gap:0.5rem; transition:all var(--transition); }
    .tab:hover { color:var(--text-primary); }
    .tab.active { color:var(--accent-blue); background:rgba(56,189,248,0.1); border-color:rgba(56,189,248,0.3); }
    .tab-count { background:var(--bg-surface); padding:0.1rem 0.4rem; border-radius:999px; font-size:0.7rem; }

    .notif-list { overflow:hidden; }
    .notif-item {
      display:flex; align-items:flex-start; gap:1rem;
      padding:1.1rem 1.5rem;
      border-bottom:1px solid var(--border-subtle);
      cursor:pointer; transition:all var(--transition);
      position:relative;
    }
    .notif-item:last-child { border-bottom:none; }
    .notif-item:hover { background:rgba(56,189,248,0.03); }
    .notif-item.unread { background:rgba(56,189,248,0.04); }
    .notif-item.unread::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:var(--accent-blue); border-radius:0 2px 2px 0; }

    .notif-icon {
      width:40px; height:40px; border-radius:10px; flex-shrink:0;
      display:flex; align-items:center; justify-content:center;
    }
    .icon-blue   { background:rgba(56,189,248,0.12); color:var(--accent-blue); }
    .icon-green  { background:rgba(52,211,153,0.12); color:var(--accent-emerald); }
    .icon-amber  { background:rgba(251,191,36,0.12); color:var(--accent-amber); }
    .icon-violet { background:rgba(129,140,248,0.12); color:var(--accent-violet); }

    .notif-content { flex:1; }
    .notif-title { font-weight:600; font-size:0.9rem; margin-bottom:0.2rem; }
    .notif-message { font-size:0.82rem; color:var(--text-secondary); line-height:1.5; }
    .notif-time { font-size:0.72rem; color:var(--text-muted); margin-top:0.35rem; }

    .notif-unread-dot { width:8px; height:8px; border-radius:50%; background:var(--accent-blue); flex-shrink:0; margin-top:0.4rem; }

    .empty-notif { display:flex; flex-direction:column; align-items:center; gap:0.75rem; padding:3.5rem; color:var(--text-secondary); }
    .empty-notif svg { opacity:0.2; }
  `]
})
export class NotificationsComponent {
  filter = 'all';

  notifications: Notification[] = [
    { id:1, type:'intern_registered', title:'New Intern Registered', message:'Priya Sharma (EMP20250101-001) has been registered in Batch 2025-A.', time:'2 minutes ago', read:false },
    { id:2, type:'batch_created', title:'Batch Created', message:'Batch 2025-B has been created with start date Jan 15, 2025.', time:'1 hour ago', read:false },
    { id:3, type:'performance_updated', title:'Performance Score Updated', message:'Rahul Kumar\'s performance score updated to 87/100.', time:'3 hours ago', read:false },
    { id:4, type:'intern_registered', title:'New Intern Registered', message:'Anita Patel (TDA20250102-001) has been registered in Batch 2025-A.', time:'Yesterday', read:true },
    { id:5, type:'batch_completed', title:'Batch Completed', message:'Batch 2024-B has successfully completed. 24 interns graduated.', time:'2 days ago', read:true },
    { id:6, type:'performance_updated', title:'Performance Evaluation Done', message:'Batch 2025-A quarterly evaluation completed. Average score: 78.5', time:'3 days ago', read:true },
    { id:7, type:'intern_registered', title:'New Intern Registered', message:'Vijay Singh (EMP20250103-002) has been registered in Batch 2025-B.', time:'4 days ago', read:true },
  ];

  get unreadCount() { return this.notifications.filter(n => !n.read).length; }

  get filteredNotifications() {
    if (this.filter === 'unread') return this.notifications.filter(n => !n.read);
    if (this.filter === 'intern')  return this.notifications.filter(n => n.type === 'intern_registered');
    if (this.filter === 'batch')   return this.notifications.filter(n => n.type.startsWith('batch'));
    return this.notifications;
  }

  getIconClass(type: string): string {
    if (type === 'intern_registered')   return 'notif-icon icon-blue';
    if (type === 'batch_created')       return 'notif-icon icon-green';
    if (type === 'performance_updated') return 'notif-icon icon-amber';
    if (type === 'batch_completed')     return 'notif-icon icon-violet';
    return 'notif-icon icon-blue';
  }

  markRead(notif: Notification) { notif.read = true; }
  markAllRead() { this.notifications.forEach(n => n.read = true); }
}
