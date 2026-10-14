import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { PageReveal } from './components/page-reveal/page-reveal';
import { Navbar } from './components/navbar/navbar';
import { Hero } from './sections/hero/hero';
import { About } from './sections/about/about';
import { Work } from './sections/work/work';
import { Skills } from './sections/skills/skills';
import { Experience } from './sections/experience/experience';
import { Contact } from './sections/contact/contact';
import { ScrollArrow } from '../app/components/scroll-arrow/scroll-arrow';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    PageReveal,
    Navbar,
    Hero,
    About,
    Work,
    Skills,
    Experience,
    Contact,
    ScrollArrow,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit, OnDestroy {
  private waveScrollTriggers: ScrollTrigger[] = [];

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      this.initWaveParallax();
      ScrollTrigger.refresh();
    });
  }

  private initWaveParallax(): void {
    const waves = gsap.utils.toArray<HTMLElement>('.section-wave');
    if (!waves.length) return;

    waves.forEach((wave, index) => {
      const svg = wave.querySelector<SVGElement>('.section-wave__svg');
      if (!svg) return;

      const parallaxAmount = index === 0 ? -22 : -16;

      const tween = gsap.to(svg, {
        y: parallaxAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: wave,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.1,
          invalidateOnRefresh: true,
        },
      });

      if (tween.scrollTrigger) {
        this.waveScrollTriggers.push(tween.scrollTrigger);
      }
    });
  }

  ngOnDestroy(): void {
    this.waveScrollTriggers.forEach((trigger) => trigger.kill());
    this.waveScrollTriggers = [];
    ScrollTrigger.refresh();
  }
}
