import { Component } from '@angular/core';

@Component({
  selector: 'app-page-reveal',
  standalone: true,
  imports: [],
  templateUrl: './page-reveal.html',
  styleUrl: './page-reveal.css',
})
export class PageReveal {
  isFinished = false;

  onAnimationEnd(): void {
    this.isFinished = true;
  }
}
