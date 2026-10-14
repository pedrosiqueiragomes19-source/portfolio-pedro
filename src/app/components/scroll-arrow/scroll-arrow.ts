import {
  AfterViewInit,
  Component,
  HostListener,
  OnDestroy,
} from '@angular/core';

@Component({
  selector: 'app-scroll-arrow',
  standalone: true,
  imports: [],
  templateUrl: './scroll-arrow.html',
  styleUrl: './scroll-arrow.css',
})
export class ScrollArrow implements AfterViewInit, OnDestroy {
  isVisible = true;
  direction: 'down' | 'up' = 'down';

  private isScrolling = false;
  private scrollTimeout?: ReturnType<typeof setTimeout>;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateDirection();
    });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.isScrolling) {
      return;
    }

    this.updateDirection();
  }

  onArrowClick(): void {
    if (this.isScrolling) {
      return;
    }

    const targetId =
      this.direction === 'down'
        ? 'contact'
        : 'home';

    const target = document.getElementById(targetId);

    if (!target) {
      console.warn(
        `Scroll Arrow: elemento #${targetId} não foi encontrado.`
      );

      return;
    }

    // Esconde a seta durante o scroll
    this.isScrolling = true;
    this.isVisible = false;

    // Faz o scroll
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    // Aguarda o scroll terminar
    this.clearScrollTimeout();

    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;

      // Atualiza a direção depois de chegar
      this.updateDirection();

      // Mostra novamente
      this.isVisible = true;
    }, 1000);
  }

  private updateDirection(): void {
    const home = document.getElementById('home');

    if (!home) {
      return;
    }

    const homeBottom = home.getBoundingClientRect().bottom;


    if (homeBottom > window.innerHeight * 0.5) {
      this.direction = 'down';
      return;
    }


    this.direction = 'up';
  }

  private clearScrollTimeout(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = undefined;
    }
  }

  ngOnDestroy(): void {
    this.clearScrollTimeout();
  }
}
