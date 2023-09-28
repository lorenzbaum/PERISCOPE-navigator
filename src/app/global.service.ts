import {Injectable, OnInit} from '@angular/core';
import {NavigatorFormValues} from "./form/form.component";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  readonly version: string = 'v0.1.1';
  readonly title: string = $localize`:App name|Name of the App:Privacy-friendliness Business Model Navigator`;

  get combinedTitle(): string {
    return `${this.title} (${this.version})`;
  }

  private formStorageKey: string = 'bmn-data';
  private formData: NavigatorFormValues | undefined = undefined;

  private likeStorageKey: string = 'bmn-like';
  private likeSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  like$ = this.likeSubject.asObservable();

  constructor() {
    this.likeSubject.next(this.getLikeDislike());
    this.likeSubject.subscribe(like => this.saveLikeDislike(like));
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

  // Like/Dislike functions
  toggleLikeDislike() {
    this.likeSubject.next(!this.likeSubject.value);
  }
  private saveLikeDislike(like: boolean) {
    this.saveToLocalStorage(this.likeStorageKey, String(like));
  }

  private getLikeDislike(): boolean {
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
