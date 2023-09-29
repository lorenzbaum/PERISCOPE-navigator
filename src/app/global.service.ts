import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  readonly version: string = 'v0.2.0';
  readonly title: string = $localize`:App name|Name of the App:Privacy-friendliness Business Model Navigator`;
  readonly shortTitle: string = $localize`:Short app name|Short name of the App:PBMN`;

  get combinedTitle(): string {
    return `${this.title} (${this.version})`;
  }

  private choiceStorageKey: string = 'bmn-data';
  private choiceDataSubject: BehaviorSubject<NavigatorChoices | undefined> = new BehaviorSubject<NavigatorChoices | undefined>(undefined);
  readonly choiceData$ = this.choiceDataSubject.asObservable();

  private likeStorageKey: string = 'bmn-like';
  private likeSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  readonly like$ = this.likeSubject.asObservable();

  get choiceValues(): NavigatorValues {
    return {
      isPlatform: {},
      hasConsumers: {},
      usesData: {},
      consumerLocation: {},
      sector: {
        'primary': -2.3588,
        'energy': -0.8027,
        'trade': 0.2138,
        'transport': -2.0428,
        'services': 0.7863,
        'media': 1.3447,
        'finance': 0.8670,
        'public': -0.4967,
        'education': 1.1406,
        'health': 1.3486,
      },
      monetization: {
        'direct monetization': 0.2485,
        'direct monetization other market side': -0.1964,
        'indirect monetization': -0.0521,
      },
      dataSource: {
        'internal data': 0.5489,
        'internal + public data': -0.1736,
        'internal + public + external data provider': -0.3753,
      },
      dataTypes: {
        basicDemographicsData: 0.7955,
        personalPreferenceData: 1.1273,
        contactInformationData: -0.1291,
        communityInteractionData: 0.0667,
        financialInformationData: -0.7997,
        secureIdentifiersData: -0.6743,
        specialCategoriesOfPersonalData: -0.3863,
      },
      internalDataUse: {
        'personalization and user experience': 0.0245,
        'business operations': -0.0245,
      },
      externalDataUse: {
        'raw data': -1.8814,
        'analyzed data': -0.7259,
        'no external use': 2.6074,
      },
      externalDataUsers: {
        'value chain': 0.6957,
        'platform users': 0.5414,
        'anyone': -1.2371,
      },
      dataTransferFrequency: {
        'on request': 0.3920,
        'continuously': -0.3920,
      },
      dataAnonymization: {
        'anonymized': 0.6400,
        'not anonymized': -0.6400,
      },
      privacySettings: {
        'control': 1.7475,
        'not control': -1.7475,
      },
      privacyEstimation: {},
    };
  }

  constructor() {
    this.likeSubject.next(this.loadLikeDislike());
    this.likeSubject.subscribe(like => this.saveLikeDislike(like));

    this.choiceDataSubject.next(this.loadChoiceData());
    this.choiceDataSubject.subscribe(choiceData => this.saveChoiceData(choiceData));
  }


  // Form functions
  get choiceData(): NavigatorChoices | undefined {
    return this.choiceDataSubject.value;
  }

  set choiceData(formData: NavigatorChoices | undefined) {
    this.choiceDataSubject.next(formData);
  }

  startNewForm() {
    this.choiceData = undefined;
  }

  private saveChoiceData(formData: NavigatorChoices | undefined) {
    if (formData) {
      this.saveToLocalStorage(this.choiceStorageKey, JSON.stringify(formData));
    } else {
      this.removeFromLocalStorage(this.choiceStorageKey);
    }
  }

  private loadChoiceData(): NavigatorChoices | undefined {
    const formData = this.getFromLocalStorage(this.choiceStorageKey);
    if (formData) {
      return JSON.parse(formData) as NavigatorChoices;
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

  // Analysis functions
  // TODO

  // Misc functions
  readonly isHandset$: Observable<boolean> = inject(BreakpointObserver)
  .observe([Breakpoints.Handset, Breakpoints.TabletPortrait, Breakpoints.WebPortrait])
  .pipe(
    map(result => result.matches),
    shareReplay()
  );
}

export interface NavigatorChoices {
  [attribute: string]: string | number | null | {
    [option: string]: boolean | null
  }
}

export interface ChoiceValues {
  [attribute: string]: number | null | {
    [option: string]: number | null
  }
}

export interface NavigatorValues {
  [attribute: string]: {
    [level: string]: number
  }
}
