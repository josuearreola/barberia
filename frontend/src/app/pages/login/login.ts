import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { catchError, finalize, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';
  isSubmitting = false;
  submitted = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    this.submitted = true;
    this.errorMessage = '';

    const email = this.email.trim();
    const password = this.password.trim();

    if (this.emailError || this.passwordError) {
      return;
    }

    this.isSubmitting = true;

    this.authService
      .login({ email, password })
      .pipe(
        timeout(4000),
        catchError((error) => {
          const isTimeout = error?.name === 'TimeoutError';
          this.errorMessage = isTimeout
            ? 'Tiempo de espera agotado. Intenta de nuevo.'
            : 'Credenciales invalidas.';
          return of(null);
        }),
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe((user) => {
        if (!user) {
          if (!this.errorMessage) {
            this.errorMessage = 'Credenciales invalidas.';
          }
          return;
        }

        const target = user.role === 'admin' ? '/admin/citas' : '/';
        this.router.navigate([target]);
      });
  }

  onFieldInput(): void {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  get emailError(): string | null {
    const value = this.email.trim();
    if (!value) {
      return this.submitted ? 'El email es requerido.' : null;
    }

    return this.isValidEmail(value) ? null : 'Ingresa un email valido.';
  }

  get passwordError(): string | null {
    const value = this.password.trim();
    if (!value) {
      return this.submitted ? 'La contrasena es requerida.' : null;
    }

    return value.length >= 6 ? null : 'La contrasena debe tener al menos 6 caracteres.';
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}
