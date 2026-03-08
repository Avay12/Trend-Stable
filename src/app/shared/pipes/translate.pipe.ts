import { Pipe, PipeTransform, inject, Signal } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

@Pipe({
  name: 'translate',
  pure: false // Impure because we want it to update when the signal in service changes
})
export class TranslatePipe implements PipeTransform {
  languageService = inject(LanguageService);

  transform(key: string): string {
    return this.languageService.translate(key);
  }
}
