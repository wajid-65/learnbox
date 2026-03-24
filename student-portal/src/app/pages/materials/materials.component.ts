import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { MaterialsService, Material } from '../../services/materials.service';

@Component({
  selector: 'app-materials',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.css']
})
export class MaterialsComponent implements OnInit {
  materials: Material[] = [];
  filtered: Material[] = [];
  searchQuery = '';
  loading = true;
  error = '';

  constructor(private materialsService: MaterialsService) {}

  ngOnInit(): void {
    this.loadMaterials();
  }

  loadMaterials(): void {
    this.loading = true;
    this.materialsService.getAll().subscribe({
      next: (res: any) => {
        this.materials = res.data || [];
        this.filtered = this.materials;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load materials.';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filtered = this.materials;
      return;
    }
    this.materialsService.search(this.searchQuery).subscribe({
      next: (res: any) => { this.filtered = res.data || []; },
      error: () => { this.error = 'Search failed.'; }
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filtered = this.materials;
  }

  download(file_url: string, title: string): void {
    const url = this.materialsService.getDownloadUrl(file_url);
    const a = document.createElement('a');
    a.href = url;
    a.download = title;
    a.target = '_blank';
    a.click();
  }
}
