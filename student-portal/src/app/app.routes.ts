import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MaterialsComponent } from './pages/materials/materials.component';
import { QuestionPapersComponent } from './pages/question-papers/question-papers.component';
import { SearchComponent } from './pages/search/search.component';
import { authGuard, loginGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '',               redirectTo: '/login', pathMatch: 'full' },
  { path: 'login',          component: LoginComponent,          canActivate: [loginGuard] },
  { path: 'register',       component: RegisterComponent,       canActivate: [loginGuard] },
  { path: 'dashboard',      component: DashboardComponent,      canActivate: [authGuard] },
  { path: 'materials',      component: MaterialsComponent,      canActivate: [authGuard] },
  { path: 'question-papers',component: QuestionPapersComponent, canActivate: [authGuard] },
  { path: 'search',         component: SearchComponent,         canActivate: [authGuard] },
  { path: '**',             redirectTo: '/login' }
];
