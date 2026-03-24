import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user_id    = '';
  name       = '';
  password   = '';
  confirm_password = '';
  department = '';
  error      = '';
  success    = '';
  loading    = false;

  departments = [
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Mathematics',
    'Physics'
  ];

  constructor(private auth: AuthService, private router: Router) {}

  onRegister(): void {
    this.error = '';
    this.success = '';

    if (!this.user_id || !this.name || !this.password || !this.confirm_password || !this.department) {
      this.error = 'All fields are required.';
      return;
    }

    if (this.user_id.trim().length < 4) {
      this.error = 'Student ID must be at least 4 characters.';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters.';
      return;
    }

    if (this.password !== this.confirm_password) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;

    this.auth.register({
      user_id:    this.user_id.trim().toUpperCase(),
      name:       this.name.trim(),
      password:   this.password,
      role:       'student',
      department: this.department
    }).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.success) {
          this.success = '✅ Account created! Redirecting to login...';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
