import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { catchError, finalize, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  usuario = '';
  telefono = '';
  email = '';
  password = '';
  errorMessage = signal('');
  isSubmitting = signal(false);
  submitted = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.submitted.set(true);
    this.errorMessage.set('');

    const usuario = this.usuario.trim();
    const telefono = this.telefono.trim();
    const email = this.email.trim();
    const password = this.password.trim();

    if (this.usuarioError || this.telefonoError || this.emailError || this.passwordError) {
      return;
    }

    this.isSubmitting.set(true);

    this.authService
      .register({
        usuario,
        telefono,
        email,
        password,
      })
      .pipe(
        timeout(4000),
        catchError(() => {
          this.errorMessage.set('No se pudo crear la cuenta o se agoto el tiempo.');
          return of(null);
        }),
        finalize(() => {
          this.isSubmitting.set(false);
        })
      )
      .subscribe((user) => {
        if (!user) {
          return;
        }

        this.router.navigate(['/']);
      });
  }

  get usuarioError(): string | null {
    const value = this.usuario.trim();
    if (!value) {
      return this.submitted() ? 'El usuario es requerido.' : null;
    }

    return value.length >= 3 ? null : 'El usuario debe tener al menos 3 caracteres.';
  }

  get telefonoError(): string | null {
    const value = this.telefono.trim();
    if (!value) {
      return this.submitted() ? 'El telefono es requerido.' : null;
    }

    return this.isValidPhone(value) ? null : 'Ingresa un telefono valido.';
  }

  get emailError(): string | null {
    const value = this.email.trim();
    if (!value) {
      return this.submitted() ? 'El email es requerido.' : null;
    }

    return this.isValidEmail(value) ? null : 'Ingresa un email valido.';
  }

  get passwordError(): string | null {
    const value = this.password.trim();
    if (!value) {
      return this.submitted() ? 'La contrasena es requerida.' : null;
    }

    return value.length >= 6 ? null : 'La contrasena debe tener al menos 6 caracteres.';
  }

    private isValidEmail(value: string): boolean {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    private isValidPhone(value: string): boolean {
      return /^[+\d\s()-]{7,20}$/.test(value);
    }
}
