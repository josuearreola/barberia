import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
  protected readonly showChrome = signal(true);

  constructor(private authService: AuthService, private router: Router) {
    this.authService.loadSession().subscribe();

    const hideOnRoutes = new Set(['/login', '/registro']);
    this.showChrome.set(!hideOnRoutes.has(this.router.url));

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.showChrome.set(!hideOnRoutes.has(event.urlAfterRedirects));
      });
  }
}