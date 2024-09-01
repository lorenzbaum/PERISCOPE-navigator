import {effect, inject, Injectable, Injector, signal} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {map} from 'rxjs/operators';
import {Analytics, isSupported as analyticsSupported, logEvent} from '@angular/fire/analytics';
import {toSignal} from '@angular/core/rxjs-interop';
import {DOCUMENT} from "@angular/common";
import {default as Languages, LocalazyLanguage} from '../locale/languages';
import {RecommenderChoices} from "./analysis.service";

export {LocalazyLanguage} from '../locale/languages';

@Injectable({providedIn: 'root'})
export class GlobalService {
  private readonly injector: Injector = inject(Injector);
  private readonly bo = inject(BreakpointObserver);
  private document = inject(DOCUMENT);
  private analytics: Analytics | undefined;

  readonly version: string = 'v0.7.5';
  readonly title: string = $localize`:App name|Name of the App:Privacy-friendly Business Models`;
  readonly shortTitle: string = $localize`:Short app name|Short name of the App:PBM`;

  get languages(): LocalazyLanguage[] {
    return Languages.languages;
  }

  switchLanguage(lang: LocalazyLanguage): void {
    this.document.cookie = `firebase-language-override=${lang.language};path=/;max-age=31536000`;
    this.document.location.reload();
  }

  private choiceStorageKey: string = 'pbm-data';
  private choiceDataSignal = signal<RecommenderChoices | undefined>(this.loadChoiceData(this.choiceStorageKey));
  readonly choiceData$ = this.choiceDataSignal.asReadonly();

  private likeStorageKey: string = 'pbm-like';
  private likeSignal = signal<boolean>(this.loadLikeDislike(this.likeStorageKey));
  readonly like$ = this.likeSignal.asReadonly();

  private themeStorageKey: string = 'pbm-theme';
  readonly themeSignal = signal<string>(this.loadTheme(this.themeStorageKey));
  readonly autoThemeSignal = signal<string>(this.autoTheme()).asReadonly();

  private urlParamStorageKey: string = 'pbm-url-params';
  private urlParamSignal = signal<URLParams>(this.loadUrlParams(this.urlParamStorageKey));
  readonly urlParams$ = this.urlParamSignal.asReadonly();

  constructor() {
    analyticsSupported().then((supported: boolean) => {
      if (supported)
        this.analytics = this.injector.get(Analytics);
    });

    effect(() => this.saveChoiceData(this.choiceDataSignal(), this.choiceStorageKey));
    effect(() => this.saveLikeDislike(this.likeSignal(), this.likeStorageKey));
    effect(() => this.saveTheme(this.themeSignal(), this.themeStorageKey));
    effect(() => this.saveUrlParams(this.urlParamSignal(), this.urlParamStorageKey));
  }

  // Form functions
  get choiceData(): RecommenderChoices | undefined {
    if (this.choiceDataSignal() === undefined)
      this.choiceDataSignal.set(this.loadChoiceData());
    return this.choiceDataSignal();
  }

  set choiceData(formData: RecommenderChoices | undefined) {
    this.choiceDataSignal.set(formData);
  }

  startNewForm() {
    this.choiceDataSignal.set(undefined);
  }

  private saveChoiceData(formData: RecommenderChoices | undefined, key: string = this.choiceStorageKey): void {
    if (formData) {
      this.saveToLocalStorage(key, JSON.stringify(formData));
    } else {
      this.removeFromLocalStorage(key);
    }
  }

  private loadChoiceData(key: string = this.choiceStorageKey): RecommenderChoices | undefined {
    const formData = this.getFromLocalStorage(key);
    if (formData !== null) {
      return JSON.parse(formData) as RecommenderChoices;
    } else {
      return undefined;
    }
  }

  // Like/Dislike functions
  get like(): boolean {
    return this.likeSignal();
  }

  set like(like: boolean) {
    this.likeSignal.set(like);
  }

  toggleLikeDislike() {
    this.likeSignal.update(like => !like);
    if (this.analytics)
      logEvent(this.analytics, 'like', {like: this.likeSignal()});
  }

  private saveLikeDislike(like: boolean, key: string = this.likeStorageKey) {
    this.saveToLocalStorage(key, String(like));
  }

  private loadLikeDislike(key: string = this.likeStorageKey): boolean {
    const like = this.getFromLocalStorage(key);
    if (like) {
      return like === 'true';
    } else {
      return false;
    }
  }

  // Theme functions
  private saveTheme(theme: string, key: string = this.themeStorageKey) {
    if (theme !== 'auto') {
      this.saveToLocalStorage(key, theme);
    } else {
      this.removeFromLocalStorage(key);
    }
  }

  private loadTheme(key: string = this.themeStorageKey): string {
    const theme = this.getFromLocalStorage(key);
    if (theme !== null) {
      return theme;
    } else {
      return 'auto';
    }
  }

  private autoTheme(): string {
    if (window.matchMedia('(prefers-color-scheme)').media !== 'not all') {
      // Set colorScheme to Dark if prefers-color-scheme is dark. Otherwise, set it to Light.
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      // If the browser doesn't support prefers-color-scheme, set it to Light.
      return 'light';
    }
  }

  // URL Parameter functions
  get urlParams(): URLParams {
    return this.urlParamSignal();
  }

  set urlParams(params: URLParams) {
    params = {...this.urlParamSignal(), ...params};
    this.urlParamSignal.set(params);
  }

  private saveUrlParams(params: URLParams, key: string = this.urlParamStorageKey) {
    this.saveToLocalStorage(key, JSON.stringify(params), sessionStorage);
  }

  private loadUrlParams(key: string = this.urlParamStorageKey): URLParams {
    const params = this.getFromLocalStorage(key, sessionStorage);
    if (params !== null) {
      return JSON.parse(params) as URLParams;
    } else {
      return {};
    }
  }

  // General localStorage functions
  private saveToLocalStorage(key: string, value: string, storage: Storage = localStorage) {
    storage.setItem(key, value);
  }

  private getFromLocalStorage(key: string, storage: Storage = localStorage): string | null {
    return storage.getItem(key);
  }

  private removeFromLocalStorage(key: string, storage: Storage = localStorage) {
    storage.removeItem(key);
  }

  private clearLocalStorage() {
    localStorage.clear();
  }


  // Misc functions
  readonly isXSmall = toSignal(this.bo.observe([Breakpoints.XSmall]).pipe(map(_ => _.matches)), {initialValue: false});

  readonly isHandset = toSignal(this.bo.observe([Breakpoints.Handset]).pipe(map(_ => _.matches)), {initialValue: false});

  readonly isTablet = toSignal(this.bo.observe([Breakpoints.Tablet]).pipe(map(_ => _.matches)), {initialValue: false});

  readonly isTabletPortrait = toSignal(this.bo.observe([Breakpoints.TabletPortrait]).pipe(map(_ => _.matches)), {initialValue: false});
}

export interface URLParams {
  [name: string]: string
}
