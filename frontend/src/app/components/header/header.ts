import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  searchQuery: string = '';

  private searchableSections = [
    { id: 'inicio', keywords: ['inicio', 'principal'] },
    { id: 'servicios', keywords: ['servicios', 'cortes', 'barba', 'afeitado', 'services'] },
    { id: 'agendar', keywords: ['agendar', 'cita', 'reservar', 'appointment', 'reserva'] },
    { id: 'galeria', keywords: ['galeria'] },
    { id: 'contacto', keywords: ['contacto', 'telefono', 'direccion', 'ubicacion'] }
  ];

  onSearch(): void {
    if (this.searchQuery.length < 2) return;

    const query = this.searchQuery.toLowerCase().trim();
    
    const foundSection = this.searchableSections.find(section => 
      section.keywords.some(keyword => keyword.includes(query))
    );
    if (foundSection) {
      this.scrollToSection(foundSection.id);
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
  }

  private scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}
