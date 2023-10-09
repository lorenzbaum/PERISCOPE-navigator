import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";

@Injectable({providedIn: 'root'})
export class GlobalService {
  readonly version: string = 'v0.4.2';
  readonly title: string = $localize`:App name|Name of the App:Privacy-friendliness Business Model Navigator`;
  readonly shortTitle: string = $localize`:Short app name|Short name of the App:PBMN`;

  get combinedTitle(): string {
    return `${this.title} (${this.version})`;
  }

  private choiceStorageKey: string = 'bmn-data';
  private choiceDataSubject: BehaviorSubject<NavigatorChoices | undefined> = new BehaviorSubject<NavigatorChoices | undefined>(this.loadChoiceData());
  readonly choiceData$ = this.choiceDataSubject.asObservable();

  private likeStorageKey: string = 'bmn-like';
  private likeSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.loadLikeDislike());
  readonly like$ = this.likeSubject.asObservable();

  private themeStorageKey: string = 'bmn-theme';
  private themeSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.loadTheme());
  readonly darkTheme$ = this.themeSubject.asObservable();

  constructor() {
    this.likeSubject.subscribe(like => this.saveLikeDislike(like));
    this.choiceDataSubject.subscribe(choiceData => this.saveChoiceData(choiceData));
    this.themeSubject.subscribe(theme => this.saveTheme(theme));
  }


  // Form functions
  get choiceData(): NavigatorChoices | undefined {
    if (!this.choiceDataSubject.value)
      this.choiceDataSubject.next(this.loadChoiceData());
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
    if (!this.likeSubject.value)
      this.likeSubject.next(this.loadLikeDislike());
    return this.likeSubject.value;
  }

  toggleLikeDislike() {
    this.likeSubject.next(!this.like);
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

  // Theme functions
  get darkTheme(): boolean {
    if (!this.themeSubject.value)
      this.themeSubject.next(this.loadTheme());
    return this.themeSubject.value;
  }

  set darkTheme(theme: boolean) {
    this.themeSubject.next(theme);
  }

  private saveTheme(theme: boolean | undefined) {
    if (theme !== undefined) {
      this.saveToLocalStorage(this.themeStorageKey, String(theme));
    } else {
      this.removeFromLocalStorage(this.themeStorageKey);
    }
  }

  private loadTheme(): boolean {
    const theme = this.getFromLocalStorage(this.themeStorageKey);
    if (theme) {
      return theme === 'true';
    } else {
      if (window.matchMedia('(prefers-color-scheme)').media !== 'not all') {
        // Set colorScheme to Dark if prefers-color-scheme is dark. Otherwise, set it to Light.
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        // If the browser doesn't support prefers-color-scheme, set it to Light.
        return false;
      }
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
  async getAnalysis(): Promise<Analysis | undefined> {
    if (this.choiceData) {
      const choiceValues = this.calculateValues(this.choiceData, this.choiceValues);
      const sum = Math.round(1000000 * this.calculateValueSum(choiceValues)) / 1000000;
      const score = Math.round(500 * (sum - this.quantiles[0]) / (this.quantiles[100] - this.quantiles[0])) / 100
      const quantile = Math.round(1000000 * this.findClosestQuantile(sum)) / 1000000;
      return {
        choiceValues: choiceValues,
        sum: sum,
        score: score,
        scoreRough: Math.ceil(score),
        quantile: quantile,
      };
    } else {
      return undefined;
    }
  }

  private calculateValues(choiceData: NavigatorChoices, valueData: NavigatorValues): ChoiceValues {
    let result: ChoiceValues = {};
    for (let attribute in choiceData) {
      let currentChoice = choiceData[attribute];
      let valueObject = valueData[attribute];
      if (currentChoice && valueObject) {
        if (typeof currentChoice === 'object') { // check boxes
          let currentResult: { [option: string]: number | null } = {};
          for (let option in currentChoice) {
            currentResult[option] = currentChoice[option] && valueObject[option] ? valueObject[option] : null;
          }
          result[attribute] = currentResult;
        } else { // normal select
          result[attribute] = valueObject[currentChoice] ? valueObject[currentChoice] : null;
        }
      } else { // no choice made or possible
        result[attribute] = null;
      }
    }
    return result;
  }

  private calculateValueSum(choiceValues: ChoiceValues): number {
    let sum = 0;
    for (let attribute in choiceValues) {
      let currentResult = choiceValues[attribute];
      if (currentResult && typeof currentResult === 'object') {
        let smallest = +Infinity;
        for (let level in currentResult) {
          const current = currentResult[level];
          smallest = current && current < smallest ? current : smallest;
        }
        sum += smallest;
      } else {
        sum += currentResult ? currentResult : 0;
      }
    }
    return sum;
  }

  private findClosestQuantile(sum: number): number {
    const quantiles = this.quantiles;
    let closestQuantile: number | null = null;
    let minDifference = Infinity;

    for (const [quantile, value] of Object.entries(quantiles)) {
      const quantileValue = parseFloat(quantile);
      const difference = sum - value;

      if (Math.abs(difference) < minDifference) {
        minDifference = difference;
        closestQuantile = quantileValue;
      }
    }
    if (minDifference >= 0) {
      closestQuantile! += (sum - quantiles[closestQuantile!]) / (quantiles[closestQuantile! + 1] - quantiles[closestQuantile!]);
    } else {
      closestQuantile! -= (sum - quantiles[closestQuantile!]) / (quantiles[closestQuantile! - 1] - quantiles[closestQuantile!]);
    }
    return closestQuantile! / 100;
  }

  private get choiceValues(): NavigatorValues {
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

  private get choiceRecommendations(): RecommendationValues {
    return {
      isPlatform: {},
      hasConsumers: {},
      usesData: {},
      consumerLocation: {},
      sector: {
        'primary': $localize`Pivoting to different sectors is not trivial. However, consider switching to other sectors for a higher privacy-friendliness score.`,
        'energy': $localize`Pivoting to different sectors is not trivial. However,  explore alternative sectors to improve your privacy-friendliness score.`,
        'trade': $localize`Your sector is considered more privacy-friendly than others. Pivoting to different sectors is not trivial. However, look into different sectors to enhance your privacy-friendliness score.`,
        'transport': $localize`Pivoting to different sectors is not trivial. However, investigate other sectors for a better privacy-friendliness score.`,
        'services': $localize`Your sector is considered more privacy-friendly than others. Pivoting to different sectors is not trivial. However, check out different sectors to boost your privacy-friendliness score.`,
        'media': $localize`Your sector is considered more privacy-friendly than others. Pivoting to different sectors is not trivial. However, consider alternative sectors to increase your privacy-friendliness score.`,
        'finance': $localize`Your sector is considered more privacy-friendly than others. Pivoting to different sectors is not trivial. However, explore different sectors for a higher privacy-friendliness score.`,
        'public': $localize`Look into other sectors to improve your privacy-friendliness score.`,
        'education': $localize`Pivoting to different sectors is not trivial. However, consider switching to other sectors for a better privacy-friendliness score.`,
        'health': $localize`Your sector is considered more privacy-friendly than others. Pivoting to different sectors is not trivial. However, investigate alternative sectors to enhance your privacy-friendliness score.`,
      },
      monetization: {
        'direct monetization': $localize`Direct monetization is perceived to be the most privacy friendly monetization strategy by consumers.`,
        'direct monetization other market side': $localize`Consider different monetization approaches to improve your privacy-friendliness score, e.g., direct monetization is associated with a higher privacy-friendliness score.`,
        'indirect monetization': $localize`Look into alternative monetization strategies to boost your privacy-friendliness score, e.g., direct monetization is associated with a higher privacy-friendliness score.`,
      },
      dataSource: {
        'internal data': $localize``,
        'internal + public data': $localize`Consider if publick available data is really necessary for your business model. Using internal data only increases the privacy-friendliness score with consumers.`,
        'internal + public + external data provider': $localize`Consider if publick and external data is really necessary for your business model. Using internal data or internal and public data increases the privacy-friendliness score with consumers.`,
      },
      dataTypes: {
        basicDemographicsData: $localize`Explore different data types for a higher privacy-friendliness score, e.g., only personal preference data is considered to be more privacy friendly by most consumers.`,
        personalPreferenceData: $localize`Personal preference data is considered to be the most privacy-friendly data type.`,
        contactInformationData: $localize`Contact information data has a negative effect on your privacy-friendliness score. Consider forgoing this information if not needed. `,
        communityInteractionData: $localize`Community interaction data is considered to be a relatively privacy-friendly data type.`,
        financialInformationData: $localize`Consider dispensing the use of financial information if possible, as it negatively affects your privacy-friendliness score.`,
        secureIdentifiersData: $localize`Re-consider the need for secure identifiers data, as is negatively affects the privacy-friendliness score of your business model.`,
        specialCategoriesOfPersonalData: $localize`Re-consider the need for special categories of personal data, as is negatively affects the privacy-friendliness score of your business model.`,
      },
      internalDataUse: {
        'personalization and user experience': $localize`Internal data use to personlize user experience is ok for most consumers. `,
        'business operations': $localize`Explore alternative internal data use methods to improve your privacy-friendliness score, e.g., only for personalization and user experience. `,
      },
      externalDataUse: {
        'raw data': $localize`Look into different levels of external data utilization for a higher privacy-friendliness score, e.g., at least sharing analzed data only or do not allow external usage of data.`,
        'analyzed data': $localize`External data sharing is considered not privacy friendly. Consider stopping this practice to increase your privacy-friendliness score.`,
        'no external use': $localize`No external data usage is considered to be the most privacy friendly external data utilization level.`,
      },
      externalDataUsers: {
        'value chain': $localize`Sharing data with partners in your value chain is ok for most consumers.`,
        'platform users': $localize`Sharing data with other platform users ok for most consumers.`,
        'anyone': $localize`Sharing data anyone is considered to be not privacy friendly. Consider restricting access to platform users or value chain partners to increase your privacy-friendliness score.`,
      },
      dataTransferFrequency: {
        'on request': $localize`Sharing data on a request-basis is ok for most consumers.`,
        'continuously': $localize`Continuous data sharing is considered to be not privacy friendly. Consider restricting data sharing to a on a request basis to increase your privacy-friendliness score.`,
      },
      dataAnonymization: {
        'anonymized': $localize`If you rely on using data, anyonymization is at least considered to be more privacy friendly by consumers.`,
        'not anonymized': $localize`Using non-anonymized data is considered to be not privacy friendly by consumers. Look into using other anonymization methods for a higher privacy-friendliness score.`,
      },
      privacySettings: {
        'control': $localize`Allowing consumers to control their privacy settings is associated with a higher privacy-friendliness score.`,
        'not control': $localize`Explore different privacy settings for a better privacy-friendliness score, e.g. allowing consumers to control their privacy settings increases the privacy-friendliness score.`,
      },
      privacyEstimation: {},
    };
  }

  get quantiles(): { [quantile: number]: number } {
    return {
      0: -9.6527,
      1: -7.008691,
      2: -6.320244,
      3: -5.8732,
      4: -5.524196,
      5: -5.2297,
      6: -4.976086,
      7: -4.749101,
      8: -4.541432,
      9: -4.354,
      10: -4.1798,
      11: -4.0165,
      12: -3.862572,
      13: -3.7163,
      14: -3.5733,
      15: -3.439415,
      16: -3.3067,
      17: -3.182077,
      18: -3.062448,
      19: -2.946039,
      20: -2.83132,
      21: -2.722902,
      22: -2.609282,
      23: -2.505363,
      24: -2.4001,
      25: -2.30035,
      26: -2.200706,
      27: -2.101074,
      28: -2.005836,
      29: -1.910049,
      30: -1.81503,
      31: -1.723011,
      32: -1.6281,
      33: -1.5365,
      34: -1.445308,
      35: -1.352035,
      36: -1.262764,
      37: -1.173097,
      38: -1.085978,
      39: -0.9981,
      40: -0.90974,
      41: -0.8221,
      42: -0.7354,
      43: -0.648183,
      44: -0.559164,
      45: -0.47209,
      46: -0.3838,
      47: -0.298,
      48: -0.2101,
      49: -0.1211,
      50: -0.0352,
      51: 0.053876,
      52: 0.138976,
      53: 0.230114,
      54: 0.315726,
      55: 0.404245,
      56: 0.4893,
      57: 0.580966,
      58: 0.668604,
      59: 0.755421,
      60: 0.8449,
      61: 0.933859,
      62: 1.0234,
      63: 1.1119,
      64: 1.1999,
      65: 1.290035,
      66: 1.3816,
      67: 1.469473,
      68: 1.5614,
      69: 1.654811,
      70: 1.74593,
      71: 1.843,
      72: 1.938768,
      73: 2.038587,
      74: 2.1359,
      75: 2.236325,
      76: 2.339244,
      77: 2.4432,
      78: 2.548182,
      79: 2.657503,
      80: 2.77322,
      81: 2.890939,
      82: 3.012574,
      83: 3.141777,
      84: 3.275192,
      85: 3.41169,
      86: 3.560668,
      87: 3.717359,
      88: 3.890044,
      89: 4.075646,
      90: 4.27332,
      91: 4.476758,
      92: 4.7029,
      93: 4.944067,
      94: 5.210116,
      95: 5.505905,
      96: 5.819072,
      97: 6.171486,
      98: 6.605486,
      99: 7.181881,
      100: 9.3804,
    }
  }

  // Misc functions
  readonly isXSmall$: Observable<boolean> = inject(BreakpointObserver)
      .observe([Breakpoints.XSmall])
      .pipe(
          map(result => result.matches),
          shareReplay()
      );

  readonly isHandset$: Observable<boolean> = inject(BreakpointObserver)
      .observe([Breakpoints.Handset])
      .pipe(
          map(result => result.matches),
          shareReplay()
      );

  readonly isTablet$: Observable<boolean> = inject(BreakpointObserver)
      .observe([Breakpoints.Tablet])
      .pipe(
          map(result => result.matches),
          shareReplay()
      );

  readonly isTabletPortrait$: Observable<boolean> = inject(BreakpointObserver)
      .observe([Breakpoints.TabletPortrait])
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

export interface RecommendationValues {
  [attribute: string]: {
    [level: string]: string
  }
}

export interface Analysis {
  choiceValues: ChoiceValues,
  sum: number,
  score: number,
  scoreRough: number, // rounded up
  quantile: number
}
