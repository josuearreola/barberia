import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
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
  private readonly platformId = inject(PLATFORM_ID);

  constructor(private readonly authService: AuthService, private readonly router: Router) {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.loadSession().subscribe();
    }

    this.showChrome.set(!this.shouldHideChrome(this.router.url));

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.showChrome.set(!this.shouldHideChrome(event.urlAfterRedirects));
      });
  }

  private shouldHideChrome(url: string): boolean {
    return url === '/login' || url === '/registro' || url.startsWith('/admin');
  }
}