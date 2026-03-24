import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  user_id = '';
  name = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onLogin(): void {
    if (!this.user_id || !this.name || !this.password) {
      this.error = 'Please enter your User ID, Full Name and Password.';
      return;
    }
    this.loading = true;
    this.error = '';

    this.auth.login(this.user_id, this.name, this.password).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.success) {
          this.auth.saveUser(res.user);
          if (res.user.role === 'student') {
            this.router.navigate(['/dashboard']);
          } else {
            this.error = 'Admins must use the Faculty/Admin portal at http://localhost:5173';
          }
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed. Please try again.';
      }
    });
  }
}
