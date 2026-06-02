import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css'
})
export class DataTable {
  columns = input<TableColumn[]>([]);
  data = input<any[]>([]);
  loading = input<boolean>(false);
  searchable = input<boolean>(true);
  pageSize = input<number>(10);

  rowClick = output<any>();
  rowEdit = output<any>();
  rowDelete = output<any>();

  searchQuery = signal('');
  currentPage = signal(1);
  sortKey = signal('');
  sortDir = signal<'asc' | 'desc'>('asc');

  filteredData = computed(() => {
    let result = [...this.data()];
    const q = this.searchQuery().toLowerCase();
    if (q) {
      result = result.filter(row =>
        this.columns().some(col => String(row[col.key] ?? '').toLowerCase().includes(q))
      );
    }
    if (this.sortKey()) {
      const key = this.sortKey();
      const dir = this.sortDir() === 'asc' ? 1 : -1;
      result.sort((a, b) => String(a[key]).localeCompare(String(b[key])) * dir);
    }
    return result;
  });

  pagedData = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredData().slice(start, start + this.pageSize());
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredData().length / this.pageSize())));

  sort(key: string) {
    if (this.sortKey() === key) {
      this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  prevPage() { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }
}