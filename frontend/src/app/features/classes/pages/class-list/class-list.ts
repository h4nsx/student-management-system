import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-class-list',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Sidebar, LoadingSpinner],
  templateUrl: './class-list.html',
  styleUrl: './class-list.css',
})
export class ClassList implements OnInit {
  private http = inject(HttpClient);
  
  classes = signal<any[]>([]);
  timetableDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
  timetable = signal<any[][]>([[], [], [], [], [], [], []]);
  isLoading = signal(true);

  ngOnInit() {
    this.http.get<any>('http://localhost:5000/api/students/classes').subscribe({
      next: (res) => {
        if (res.success) {
          const now = new Date();
          const activeClasses = [];
          const parsedTimetable: any[][] = [[], [], [], [], [], [], []];

          for (const c of res.data) {
            // 15-week logic calculation
            const startDate = new Date(c.start_date || new Date());
            const totalWeeks = c.total_weeks || 15;
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + (totalWeeks * 7));
            
            c.isEnded = now > endDate;
            c.weeksLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7)));
            
            activeClasses.push(c);

            // Timetable logic (only if not ended)
            if (!c.isEnded && c.schedule) {
              const parts = c.schedule.split(',').map((s: string) => s.trim());
              for (const p of parts) {
                const match = p.match(/(Thu \d|Chu Nhat)\s*\(([^)]+)\)/i);
                if (match) {
                  const dayStr = match[1];
                  const periods = match[2];
                  let dayIndex = -1;
                  if (dayStr === 'Thu 2') dayIndex = 0;
                  else if (dayStr === 'Thu 3') dayIndex = 1;
                  else if (dayStr === 'Thu 4') dayIndex = 2;
                  else if (dayStr === 'Thu 5') dayIndex = 3;
                  else if (dayStr === 'Thu 6') dayIndex = 4;
                  else if (dayStr === 'Thu 7') dayIndex = 5;
                  else if (dayStr === 'Chu Nhat') dayIndex = 6;
                  
                  if (dayIndex !== -1) {
                    parsedTimetable[dayIndex].push({
                      courseName: c.name,
                      courseCode: c.code,
                      room: c.room,
                      periods: periods,
                      timeString: this.getPeriodTime(periods)
                    });
                  }
                }
              }
            }
          }
          
          this.classes.set(activeClasses);
          this.timetable.set(parsedTimetable);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching classes', err);
        this.isLoading.set(false);
      }
    });
  }

  getPeriodTime(periods: string): string {
    const timeMap: {[key: number]: {start: string, end: string}} = {
      1: {start: '07:00', end: '07:50'},
      2: {start: '07:50', end: '08:40'},
      3: {start: '08:50', end: '09:40'},
      4: {start: '09:50', end: '10:40'},
      5: {start: '10:40', end: '11:30'},
      6: {start: '13:00', end: '13:50'},
      7: {start: '13:50', end: '14:40'},
      8: {start: '14:50', end: '15:40'},
      9: {start: '15:50', end: '16:40'},
      10: {start: '16:40', end: '17:30'},
      11: {start: '18:00', end: '18:50'},
      12: {start: '18:50', end: '19:40'},
      13: {start: '19:40', end: '20:30'}
    };

    const parts = periods.split('-');
    if (parts.length === 2) {
      const startP = parseInt(parts[0]);
      const endP = parseInt(parts[1]);
      if (timeMap[startP] && timeMap[endP]) {
        return `${timeMap[startP].start} - ${timeMap[endP].end}`;
      }
    } else if (parts.length === 1) {
      const p = parseInt(parts[0]);
      if (timeMap[p]) {
        return `${timeMap[p].start} - ${timeMap[p].end}`;
      }
    }
    return '';
  }
}
