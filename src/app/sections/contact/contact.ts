import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { LanguageService } from '../../core/services/language.service';
import { ContactService } from '../../core/services/contact.service';

// ============================================================
// TIPO DO ESTADO DO FORMULÁRIO
// ============================================================

type FormState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements AfterViewInit, OnDestroy {
  // =========================================================
  // SECTION
  // =========================================================

  @ViewChild('contactSection', { static: true })
  contactSection!: ElementRef<HTMLElement>;

  // =========================================================
  // INTERNAL
  // =========================================================

  private sectionElement!: HTMLElement;

  // =========================================================
  // FORM STATE
  // =========================================================

  formState: FormState = 'idle';
  errorMessage = '';

  /** Campos do formulário */
  formData = {
    name: '',
    email: '',
    message: '',
    /** Campo honeypot anti-spam (deve ficar vazio) */
    honeypot: '',
  };

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    public languageService: LanguageService,
    private contactService: ContactService
  ) {}

  // =========================================================
  // LIFECYCLE
  // =========================================================

  ngAfterViewInit(): void {
    this.sectionElement = this.contactSection.nativeElement;
  }

  // =========================================================
  // SUBMIT
  // =========================================================

  onSubmit(form: NgForm): void {
    // Verificação básica de validade e estado
    if (form.invalid || this.formState === 'loading') {
      return;
    }

    // Anti-spam: se o honeypot foi preenchido, silenciosamente não envia
    if (this.formData.honeypot) {
      this.simulateSuccess(form);
      return;
    }

    this.formState = 'loading';
    this.errorMessage = '';

    this.contactService
      .sendMessage({
        name: this.formData.name.trim(),
        email: this.formData.email.trim(),
        message: this.formData.message.trim(),
      })
      .subscribe({
        next: () => {
          this.formState = 'success';
          form.resetForm();
          this.formData = { name: '', email: '', message: '', honeypot: '' };
        },
        error: (err: Error) => {
          this.formState = 'error';
          this.errorMessage = err.message;
        },
      });
  }

  /** Utilitário para reset manual após erro */
  resetForm(): void {
    this.formState = 'idle';
    this.errorMessage = '';
  }

  /** Getter de conveniência para verificar estado */
  get isLoading(): boolean {
    return this.formState === 'loading';
  }

  get isSuccess(): boolean {
    return this.formState === 'success';
  }

  get isError(): boolean {
    return this.formState === 'error';
  }

  // =========================================================
  // PRIVATE
  // =========================================================

  private simulateSuccess(form: NgForm): void {
    this.formState = 'success';
    form.resetForm();
    this.formData = { name: '', email: '', message: '', honeypot: '' };
  }

  // =========================================================
  // CLEANUP
  // =========================================================

  ngOnDestroy(): void {
    // Reservado para limpeza futura
  }
}
