import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { AuthService, User } from '../../services/auth.service';
import { MaterialsService } from '../../services/materials.service';
import { QuestionPapersService } from '../../services/question-papers.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  materialsCount = 0;
  papersCount = 0;
  greeting = '';

  constructor(
    private auth: AuthService,
    private materialsService: MaterialsService,
    private qpService: QuestionPapersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUser();
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Good Morning';
    else if (hour < 17) this.greeting = 'Good Afternoon';
    else this.greeting = 'Good Evening';

    this.materialsService.getAll().subscribe((res: any) => {
      this.materialsCount = res.data?.length ?? 0;
    });
    this.qpService.getAll().subscribe((res: any) => {
      this.papersCount = res.data?.length ?? 0;
    });
  }

  navigate(path: string): void {
    this.router.navigate(['/' + path]);
  }
}
