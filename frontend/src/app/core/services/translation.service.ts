import { Injectable } from '@angular/core';
import { KA } from '../translations/ka';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translations: any = KA;

  translate(key: string): string {
    return this.translations[key] || key;
  }
}
