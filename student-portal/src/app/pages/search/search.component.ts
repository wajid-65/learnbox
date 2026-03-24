import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { MaterialsService, Material } from '../../services/materials.service';
import { QuestionPapersService, QuestionPaper } from '../../services/question-papers.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  searchQuery = '';
  materials: Material[] = [];
  papers: QuestionPaper[] = [];
  searched = false;
  loading = false;

  constructor(
    private materialsService: MaterialsService,
    private qpService: QuestionPapersService
  ) {}

  onSearch(): void {
    if (!this.searchQuery.trim()) return;
    this.loading = true;
    this.searched = false;
    this.materials = [];
    this.papers = [];

    this.materialsService.search(this.searchQuery).subscribe({
      next: (res: any) => {
        this.materials = res.data || [];
        this.checkDone();
      },
      error: () => this.checkDone()
    });

    this.qpService.search(this.searchQuery).subscribe({
      next: (res: any) => {
        this.papers = res.data || [];
        this.checkDone();
      },
      error: () => this.checkDone()
    });
  }

  private checkDone(): void {
    this.loading = false;
    this.searched = true;
  }

  downloadMaterial(file_url: string, title: string): void {
    const a = document.createElement('a');
    a.href = this.materialsService.getDownloadUrl(file_url);
    a.download = title;
    a.target = '_blank';
    a.click();
  }

  downloadPaper(file_url: string, subject: string): void {
    const a = document.createElement('a');
    a.href = this.qpService.getDownloadUrl(file_url);
    a.download = subject;
    a.target = '_blank';
    a.click();
  }
}
