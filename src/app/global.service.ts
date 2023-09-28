import {Injectable} from '@angular/core';
import {NavigatorFormValues} from "./form/form.component";

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  readonly version: string = 'v0.1.0';
  readonly title: string = $localize`:App name|Name of the App:Privacy-friendliness Business Model Navigator`;

  private formStorageKey: string = 'bmn-data';
  private formData: NavigatorFormValues | undefined = undefined;

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
    this.removeFromLocalStorage(this.formStorageKey);
    this.formData = undefined;
  }

  saveFormData(formData: NavigatorFormValues) {
    this.formData = formData;
    this.saveToLocalStorage(this.formStorageKey, JSON.stringify(this.formData));
  }

  getFormData(): NavigatorFormValues | undefined {
    if (this.formData) {
      return this.formData;
    } else {
      const formData = this.getFromLocalStorage(this.formStorageKey);
      if (formData) {
        this.formData = JSON.parse(formData) as NavigatorFormValues;
        return this.formData;
      } else {
        return undefined;
      }
    }
  }
}
