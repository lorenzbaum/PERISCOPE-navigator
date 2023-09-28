import {Injectable} from '@angular/core';
import {ɵFormGroupValue, ɵTypedOrUntyped} from "@angular/forms";

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  readonly version: string = 'v0.0.4';
  readonly title: string = $localize`:App name|Name of the App:Privacy-friendliness Business Model Navigator`;

  private formStorageKey: string = 'bmn-data';
  private formData: object | undefined;

  get combinedTitle(): string {
    return `${this.title} (${this.version})`;
  }

  private saveToLocalStorage(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  private getFromLocalStorage(key: string): string | null {
    return localStorage.getItem(key);
  }

  private removeFromLocalStorage(key: string) {
    localStorage.removeItem(key);
  }

  private clearLocalStorage() {
    localStorage.clear();
  }

  startNewForm() {
    this.clearLocalStorage();
    this.formData = undefined;
  }

  saveFormData(formData: ɵTypedOrUntyped<any, ɵFormGroupValue<any>, any>) {
    this.formData = formData;
    this.saveToLocalStorage(this.formStorageKey, JSON.stringify(this.formData));
  }

  getFormData(): object | undefined {
    if (this.formData) {
      return this.formData;
    } else {
      const formData = this.getFromLocalStorage(this.formStorageKey);
      if (formData) {
        this.formData = JSON.parse(formData);
        return this.formData;
      } else {
        return undefined;
      }
    }
  }
}
