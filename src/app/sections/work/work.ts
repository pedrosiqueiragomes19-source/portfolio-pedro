// Componente da seção de projetos (Work)

import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LanguageService } from '../../core/services/language.service';
import { PROJECTS, Project } from '../../data/projects';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-work',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './work.html',
  styleUrl: './work.css',
})
export class Work implements AfterViewInit, OnDestroy {
  @ViewChild('workSection', { static: true })
  workSection!: ElementRef<HTMLElement>;

  githubProfileUrl = 'https://github.com/pedrosiqueiragomes19-source';
  projects: Project[] = PROJECTS;

  private ctx?: gsap.Context;

  constructor(public languageService: LanguageService) {}

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      this.createAnimations();
    });
  }

  // Cria animações sutis de revelação nos cards de projetos
  private createAnimations(): void {
    if (!this.workSection?.nativeElement) return;
    const section = this.workSection.nativeElement;

    this.ctx = gsap.context(() => {
      const header = section.querySelector('.work-header');
      if (header) {
        gsap.fromTo(
          header,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: header,
              start: 'top 92%',
              end: 'top 65%',
              scrub: 1,
            },
          },
        );
      }

      const projectElements = Array.from(section.querySelectorAll('.work-project')) as HTMLElement[];
      projectElements.forEach((project) => {
        gsap.fromTo(
          project,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: project,
              start: 'top 88%',
              end: 'top 55%',
              scrub: 1,
            },
          },
        );
      });
      ScrollTrigger.refresh();
    }, section);
  }

  // Limpa animações ao destruir o componente
  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
