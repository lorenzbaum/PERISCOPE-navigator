import {Injectable} from '@angular/core';
import {NavigatorFormValues} from "./form/form.component";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  readonly version: string = 'v0.1.2';
  readonly title: string = $localize`:App name|Name of the App:Privacy-friendliness Business Model Navigator`;
  get combinedTitle(): string {
    return `${this.title} (${this.version})`;
  }

  private formStorageKey: string = 'bmn-data';
  private formDataSubject: BehaviorSubject<NavigatorFormValues | undefined> = new BehaviorSubject<NavigatorFormValues | undefined>(undefined);
  readonly formData$ = this.formDataSubject.asObservable();

  private likeStorageKey: string = 'bmn-like';
  private likeSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  readonly like$ = this.likeSubject.asObservable();

  constructor() {
    this.likeSubject.next(this.loadLikeDislike());
    this.likeSubject.subscribe(like => this.saveLikeDislike(like));

    this.formDataSubject.next(this.loadFormData());
    this.formDataSubject.subscribe(formData => this.saveFormData(formData));
  }


  // Form functions
  get formData(): NavigatorFormValues | undefined {
    return this.formDataSubject.value;
  }

  set formData(formData: NavigatorFormValues | undefined) {
    this.formDataSubject.next(formData);
  }

  startNewForm() {
    this.formData = undefined;
  }

  private saveFormData(formData: NavigatorFormValues | undefined) {
    if (formData) {
      this.saveToLocalStorage(this.formStorageKey, JSON.stringify(formData));
    } else {
      this.removeFromLocalStorage(this.formStorageKey);
    }
  }

  private loadFormData(): NavigatorFormValues | undefined {
    const formData = this.getFromLocalStorage(this.formStorageKey);
    if (formData) {
      return JSON.parse(formData) as NavigatorFormValues;
    } else {
      return undefined;
    }
  }

  // Like/Dislike functions
  get like(): boolean {
    return this.likeSubject.value;
  }

  toggleLikeDislike() {
    this.likeSubject.next(!this.likeSubject.value);
  }
  private saveLikeDislike(like: boolean) {
    this.saveToLocalStorage(this.likeStorageKey, String(like));
  }

  private loadLikeDislike(): boolean {
    const like = this.getFromLocalStorage(this.likeStorageKey);
    if (like) {
      return like === 'true';
    } else {
      return false;
    }
  }

  // General localStorage functions
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
}
