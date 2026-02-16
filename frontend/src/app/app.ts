import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { SocialSidebar } from './components/social-sidebar/social-sidebar';
import { Hero } from './components/hero/hero';
import { Services } from './components/services/services';
import { Booking } from './components/booking/booking';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, SocialSidebar, Hero, Services, Booking],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}