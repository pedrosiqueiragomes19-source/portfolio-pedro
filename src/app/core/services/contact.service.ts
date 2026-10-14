// Serviço de envio de mensagem de contato para a API Serverless

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { LanguageService } from './language.service';

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
  honeypot?: string;
  lang?: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private readonly apiUrl = '/api/contact';

  constructor(
    private http: HttpClient,
    private languageService: LanguageService,
  ) {}

  // Envia os dados do formulário para o endpoint serverless com timeout
  sendMessage(payload: ContactPayload): Observable<ContactResponse> {
    const enrichedPayload: ContactPayload = {
      ...payload,
      lang: this.languageService.language(),
    };

    return this.http.post<ContactResponse>(this.apiUrl, enrichedPayload).pipe(
      timeout(10000),
      catchError((error: HttpErrorResponse) => {
        const isEn = this.languageService.language() === 'en';
        let fallbackMessage = isEn
          ? 'An unexpected error occurred. Please try again.'
          : 'Ocorreu um erro inesperado. Tente novamente.';

        if (error.status === 429) {
          fallbackMessage = isEn
            ? 'Too many attempts. Please wait a moment.'
            : 'Muitas tentativas. Aguarde um momento antes de tentar novamente.';
        } else if (error.status === 0) {
          fallbackMessage = isEn
            ? 'Could not connect to server. Please try again.'
            : 'Não foi possível conectar ao servidor. Tente novamente.';
        }

        const message = error.error?.message || fallbackMessage;
        return throwError(() => new Error(message));
      }),
    );
  }
}
