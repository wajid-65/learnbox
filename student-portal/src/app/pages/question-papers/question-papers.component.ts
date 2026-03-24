import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { QuestionPapersService, QuestionPaper } from '../../services/question-papers.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-question-papers',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './question-papers.component.html',
  styleUrls: ['./question-papers.component.css']
})
export class QuestionPapersComponent implements OnInit, OnDestroy {
  papers: QuestionPaper[] = [];
  filtered: QuestionPaper[] = [];
  searchQuery = '';
  loading = true;
  error = '';

  // ngOnDestroy — store subscriptions so we can cancel them on destroy
  private paperSub!: Subscription;
  private searchSub!: Subscription;

  constructor(private qpService: QuestionPapersService) {}

  ngOnInit(): void {
    this.loadPapers();
  }

  loadPapers(): void {
    this.loading = true;
    // Store subscription reference so ngOnDestroy can unsubscribe it
    this.paperSub = this.qpService.getAll().subscribe({
      next: (res: any) => {
        this.papers = res.data || [];
        this.filtered = this.papers;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load question papers.';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filtered = this.papers;
      return;
    }
    this.searchSub = this.qpService.search(this.searchQuery).subscribe({
      next: (res: any) => { this.filtered = res.data || []; },
      error: () => { this.error = 'Search failed.'; }
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filtered = this.papers;
  }

  // ngOnDestroy — runs when user navigates away from this page
  // Unsubscribes RxJS streams to prevent memory leaks
  ngOnDestroy(): void {
    this.paperSub?.unsubscribe();
    this.searchSub?.unsubscribe();
  }

  download(file_url: string, subject: string): void {
    const url = this.qpService.getDownloadUrl(file_url);
    const a = document.createElement('a');
    a.href = url;
    a.download = subject;
    a.target = '_blank';
    a.click();
  }
}
