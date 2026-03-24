import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-hero',
    imports: [],
    templateUrl: './hero.html',
    styleUrl: './hero.css',
})
export class Hero {
    private readonly platformId = inject(PLATFORM_ID);

    scrollToSection(sectionId: string): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}