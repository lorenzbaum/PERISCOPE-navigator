import {effect, inject, Injectable, Injector, isDevMode, signal} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {map} from 'rxjs/operators';
import {Analytics, isSupported as analyticsSupported, logEvent} from '@angular/fire/analytics';
import {fetchAndActivate, getString, isSupported as configSupported, RemoteConfig} from '@angular/fire/remote-config';
import {toSignal} from '@angular/core/rxjs-interop';
import {DOCUMENT} from "@angular/common";
import {default as Languages, LocalazyLanguage} from '../locale/languages';

export {LocalazyLanguage} from '../locale/languages';

@Injectable({providedIn: 'root'})
export class GlobalService {
  private readonly injector: Injector = inject(Injector);
  private readonly bo = inject(BreakpointObserver);
  private document = inject(DOCUMENT);
  private analytics: Analytics | undefined;
  private remoteConfig: RemoteConfig | undefined;

  readonly version: string = 'v0.7.3';
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
    configSupported().then((supported: boolean) => {
      if (supported) {
        this.remoteConfig = this.injector.get(RemoteConfig);
        if (isDevMode())
          this.remoteConfig.settings.minimumFetchIntervalMillis = 3600000;
        this.remoteConfig.defaultConfig = {
          configuration: JSON.stringify({default: this._defaultValues}),
          quantiles: JSON.stringify({default: this._defaultQuantiles}),
        };
        fetchAndActivate(this.remoteConfig);
      }
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

  // Analysis functions
  async getAnalysis(choiceData: RecommenderChoices | undefined, region?: string): Promise<Analysis | undefined> {
    if (choiceData) {
      await fetchAndActivate(this.remoteConfig!);
      region = (!region) ? choiceData['consumerLocation'] as string : region;
      let choiceValuesAndRecommendations: ChoiceValueAndRecommendation[] =
        this.calculateValuesAndRecommendations(choiceData, this.getRegionalChoiceValues(region), this.choiceStrings);
      const sum = this.restrictSum(this.calculateValueSum(choiceValuesAndRecommendations), region);
      const score = this.calculateScore(sum, region);
      const quantile = this.findClosestQuantile(sum, region);
      choiceValuesAndRecommendations = this.calculateRecommendationEffects(choiceValuesAndRecommendations, sum, score, quantile, region);
      choiceValuesAndRecommendations = this.sortAndFilterRecommendations(choiceValuesAndRecommendations);
      return {
        choiceValues: choiceValuesAndRecommendations,
        sum: Math.round(1000000 * sum) / 1000000,
        score: Math.round(500 * score) / 100,
        scoreRough: Math.ceil(5 * score),
        quantile: Math.round(1000000 * quantile) / 1000000,
      };
    } else {
      return undefined;
    }
  }

  private restrictSum(sum: number, region?: string): number {
    return Math.min(Math.max(sum, this.getRegionalQuantiles(region)[0]), this.getRegionalQuantiles(region)[100]);
  }

  private calculateValuesAndRecommendations(choiceData: RecommenderChoices,
                                            choiceValues: ChoiceValues,
                                            choiceStrings: ChoiceStrings): ChoiceValueAndRecommendation[] {
    let result: ChoiceValueAndRecommendation[] = [];
    for (let attribute in choiceData) {
      const currentChoice = choiceData[attribute];
      const choiceValue = choiceValues[attribute];
      const choiceString = choiceStrings[attribute];
      if (currentChoice && choiceString && choiceValue) {
        if (typeof currentChoice === 'object') { // check boxes
          for (let level in currentChoice) {
            if (currentChoice[level] == true)
              result.push({
                attribute: attribute,
                level: level,
                value: choiceValue[level],
                recommendation: choiceString.levels[level].recommendation,
              });
          }
        } else { // normal select
          result.push({
            attribute: attribute,
            level: currentChoice,
            value: choiceValue[currentChoice],
            recommendation: choiceString.levels[currentChoice].recommendation,
          });
        }
      } else { // no choice made or possible, should not run
        result.push({
          attribute: attribute,
          level: '',
          value: null,
          recommendation: undefined,
        });
      }
    }
    return this.sortChoiceValues(result);
  }

  private sortChoiceValues(choiceValues: ChoiceValueAndRecommendation[]): ChoiceValueAndRecommendation[] {
    return choiceValues.sort((a, b) => {
      return a.value && b.value ? a.value - b.value : !a.value ? +Infinity : -Infinity;
    });
  }

  private sortAndFilterRecommendations(choiceValues: ChoiceValueAndRecommendation[]): ChoiceValueAndRecommendation[] {
    return choiceValues
      .filter(value => value.changeInSum! > 0)
      .sort((a, b) => {
        return a.changeInSum && b.changeInSum ? b.changeInSum - a.changeInSum : !a.changeInSum ? +Infinity : -Infinity;
      });
  }

  private calculateValueSum(choiceValues: ChoiceValueAndRecommendation[]): number {
    choiceValues = this.sortChoiceValues(choiceValues) as ChoiceValueAndRecommendation[];
    let usedAttributes = new Set<string>();
    let sum = 0;
    for (let currentResult of choiceValues) {
      if (currentResult.value && !usedAttributes.has(currentResult.attribute)) {
        sum += currentResult.value;
        usedAttributes.add(currentResult.attribute);
      }
    }
    return sum;
  }

  private calculateScore(sum: number, region?: string): number {
    const quantiles = this.getRegionalQuantiles(region);
    return (sum - quantiles[0]) / (quantiles[100] - quantiles[0]);
  }

  private findClosestQuantile(sum: number, region?: string): number {
    let quantIndex: number | null = null;
    let minDifference = Infinity;

    for (const [index, [quantile, value]] of Object.entries(this.getRegionalQuantiles(region)).entries()) {
      const difference = sum - value;
      if (Math.abs(difference) < minDifference) {
        minDifference = difference;
        quantIndex = index;
      }
    }
    const quantiles = Object.keys(this.getRegionalQuantiles(region)).map(Number);
    const values = Object.values(this.getRegionalQuantiles(region));
    if (minDifference === 0) {
      return quantiles[quantIndex!] / 100;
    } else if (minDifference > 0) {
      return (quantiles[quantIndex!] + minDifference / (values[quantIndex! + 1] - values[quantIndex!]) * (quantiles[quantIndex! + 1] - quantiles[quantIndex!])) / 100;
    } else {
      return (quantiles[quantIndex!] + minDifference / (values[quantIndex! - 1] - values[quantIndex!]) * (quantiles[quantIndex! - 1] - quantiles[quantIndex!])) / 100;
    }
  }

  private calculateRecommendationEffects(choiceValues: ChoiceValueAndRecommendation[], sum: number, score: number, quantile: number, region?: string): ChoiceValueAndRecommendation[] {
    return choiceValues.map((choiceValue, index) => {
      let changeInSum: number | null = null;
      let changeInScore: number | null = null;
      let changeInQuantile: number | null = null;
      let backupValue = choiceValue.value;
      if (backupValue) {
        // set value to null
        const secondBestValue = this.getSecondBestLevelValue(choiceValue.attribute, choiceValue.level, region) || null;
        const newSum = Math.round(1000000 * (sum - backupValue + secondBestValue!)) / 1000000;
        changeInSum = Math.round(1000000 * (newSum - sum)) / 1000000;
        changeInScore = Math.round(500 * (this.calculateScore(newSum, region) - score)) / 100;
        changeInQuantile = Math.round(1000000 * (this.findClosestQuantile(newSum) - quantile)) / 1000000;
      }
      return {
        ...choiceValue,
        value: backupValue,
        changeInSum: changeInSum,
        changeInScore: changeInScore,
        changeInQuantile: changeInQuantile,
      }
    });
  }

  private getSecondBestLevelValue(attribute: string, level: string | number, region?: string): number | null {
    const valueObject = this.getRegionalChoiceValues(region)[attribute];
    const levelValue = valueObject[level];
    if (valueObject && levelValue) {
      let sortedValues = Object.entries(valueObject).sort((a, b) => {
        return a[1] && b[1] ? a[1] - b[1] : !a[1] ? +Infinity : -Infinity;
      });
      sortedValues = sortedValues.filter(level => level[1] !== null && level[1] >= levelValue);
      if (sortedValues.length > 1)
        return sortedValues[1][1];
      else
        return sortedValues[0] ? sortedValues[0][1] : null;
    }
    return null;
  }

  public get choiceStrings(): ChoiceStrings {
    return {
      isPlatform: {
        name: $localize`Online platform`,
        question: $localize`Is your business an online platform or does it have the potential to be one?`,
        levels: {
          'yes': {name: $localize`Yes`},
          'not yet': {name: $localize`Not yet, but has the potential`},
          'no': {name: $localize`No`},
        }
      },
      hasConsumers: {
        name: $localize`Platform has consumers`,
        question: $localize`Is your platform used by individual end users (consumers) or does it have the potential to be used by them?`,
        levels: {
          'yes': {name: $localize`Yes`},
          'not yet': {name: $localize`Not yet, but we plan to`},
          'no': {name: $localize`No`},
        }
      },
      usesData: {
        name: $localize`Platform relies on data`,
        question: $localize`Does your platform rely on user data to generate value for your users?`,
        levels: {
          'yes': {name: $localize`Yes`},
          'no': {name: $localize`No`},
        }
      },
      consumerLocation: {
        name: $localize`Consumer location`,
        question: $localize`Where are most consumers of your platform located?`,
        levels: {
          'europe': {name: $localize`Europe`},
          'north america': {name: $localize`North America`},
          'other': {name: $localize`Other`}
        }
      },
      sector: {
        name: $localize`Sector`,
        question: $localize`Please select the sector of your platform.`,
        levels: {
          'primary': {
            name: $localize`Primary Industries, Manufacturing and Production`,
            recommendation: $localize`Pivoting to different sectors is not trivial. However, consider switching to other sectors for a higher privacy-friendliness score.`
          },
          'energy': {
            name: $localize`Energy, Utilities, Infrastructure and Environment`,
            recommendation: $localize`Pivoting to different sectors is not trivial. However, explore alternative sectors to improve your privacy-friendliness score.`
          },
          'trade': {
            name: $localize`Trade and Commerce`,
            recommendation: $localize`Your sector is considered more privacy-friendly than others. Pivoting to different sectors is not trivial. However, look into different sectors to enhance your privacy-friendliness score.`
          },
          'transport': {
            name: $localize`Transportation and Logistics`,
            recommendation: $localize`Pivoting to different sectors is not trivial. However, investigate other sectors for a better privacy-friendliness score.`
          },
          'services': {
            name: $localize`Services and Hospitality`,
            recommendation: $localize`Your sector is considered more privacy-friendly than others. Pivoting to different sectors is not trivial. However, check out different sectors to boost your privacy-friendliness score.`
          },
          'media': {
            name: $localize`Media, Communication, and Information`,
            recommendation: $localize`Your sector is considered more privacy-friendly than others. Pivoting to different sectors is not trivial. However, consider alternative sectors to increase your privacy-friendliness score.`
          },
          'finance': {
            name: $localize`Financial and Professional Services`,
            recommendation: $localize`Your sector is considered more privacy-friendly than others. Pivoting to different sectors is not trivial. However, explore different sectors for a higher privacy-friendliness score.`
          },
          'public': {
            name: $localize`Public Services and Governance`,
            recommendation: $localize`Look into other sectors to improve your privacy-friendliness score.`
          },
          'education': {
            name: $localize`Education, Arts, and Culture`,
            recommendation: $localize`Pivoting to different sectors is not trivial. However, consider switching to other sectors for a better privacy-friendliness score.`
          },
          'health': {
            name: $localize`Health and Wellness`,
            recommendation: $localize`Your sector is considered more privacy-friendly than others. Pivoting to different sectors is not trivial. However, investigate alternative sectors to enhance your privacy-friendliness score.`
          },
        }
      },
      monetization: {
        name: $localize`Monetization`,
        question: $localize`What is your monetization strategy?`,
        levels: {
          'direct monetization': {
            name: $localize`Direct monetization of platform users (consumers)`,
            recommendation: $localize`Direct monetization is perceived to be the most privacy friendly monetization strategy by consumers.`
          },
          'direct monetization other market side': {
            name: $localize`Direct monetization from other market side (businesses)`,
            recommendation: $localize`Consider different monetization approaches to improve your privacy-friendliness score, e.g., direct monetization is associated with a higher privacy-friendliness score.`
          },
          'indirect monetization': {
            name: $localize`Indirect monetization, e.g. via advertisement`,
            recommendation: $localize`Look into alternative monetization strategies to boost your privacy-friendliness score, e.g., direct monetization is associated with a higher privacy-friendliness score.`
          },
        }
      },
      dataSource: {
        name: $localize`Data source`,
        question: $localize`How does your platform collect user data?`,
        levels: {
          'internal data': {
            name: $localize`Collect only internal data, e.g., …`,
            recommendation: $localize``
          },
          'internal + public data': {
            name: $localize`Collect internal data and combine it with publicly available data, e.g., …`,
            recommendation: $localize`Consider if public available data is really necessary for your business model. Using internal data only increases the privacy-friendliness score with consumers.`
          },
          'internal + public + external data provider': {
            name: $localize`Collect internal data, publicly available data and data from an external data providers, e.g., …`,
            recommendation: $localize`Consider if public and external data is really necessary for your business model. Using internal data or internal and public data increases the privacy-friendliness score with consumers.`
          },
        }
      },
      dataTypes: {
        name: $localize`Data types`,
        question: $localize`Which data types do you require and collect from your users?`,
        levels: {
          'basicDemographicsData': {
            name: $localize`Basic demographics data`,
            recommendation: $localize`Explore different data types for a higher privacy-friendliness score, e.g., only personal preference data is considered to be more privacy friendly by most consumers.`
          },
          'personalPreferenceData': {
            name: $localize`Personal preference data`,
            recommendation: $localize`Personal preference data is considered to be the most privacy-friendly data type.`
          },
          'contactInformationData': {
            name: $localize`Contact information data`,
            recommendation: $localize`Contact information data has a negative effect on your privacy-friendliness score. Consider forgoing this information if not needed.`
          },
          'communityInteractionData': {
            name: $localize`Community interaction data`,
            recommendation: $localize`Community interaction data is considered to be a relatively privacy-friendly data type.`
          },
          'financialInformationData': {
            name: $localize`Financial information data`,
            recommendation: $localize`Consider dispensing the use of financial information if possible, as it negatively affects your privacy-friendliness score.`
          },
          'secureIdentifiersData': {
            name: $localize`Secure identifiers data`,
            recommendation: $localize`Re-consider the need for secure identifiers data, as is negatively affects the privacy-friendliness score of your business model.`
          },
          'specialCategoriesOfPersonalData': {
            name: $localize`Special categories of personal data`,
            recommendation: $localize`Re-consider the need for special categories of personal data, as is negatively affects the privacy-friendliness score of your business model.`
          },
        }
      },
      internalDataUse: {
        name: $localize`Internal data use`,
        question: $localize`How does your platform use collected user data internally?`,
        levels: {
          'personalization and user experience': {
            name: $localize`We use user data for personalization and to improve user experience.`,
            recommendation: $localize`Internal data use to personalize user experience is ok for most consumers.`
          },
          'business operations': {
            name: $localize`We use user data to improve our business operations.`,
            recommendation: $localize`Explore alternative internal data use methods to improve your privacy-friendliness score, e.g., only for personalization and user experience.`
          },
        }
      },
      externalDataUse: {
        name: $localize`External data access`,
        question: $localize`Do external users have (payed) access to your collected user data?`,
        levels: {
          'raw data': {
            name: $localize`Yes, access to raw user data`,
            recommendation: $localize`Look into different levels of external data utilization for a higher privacy-friendliness score, e.g., at least sharing analyzed data only or do not allow external usage of data.`
          },
          'analyzed data': {
            name: $localize`Yes, access to analyzed or aggregated user data`,
            recommendation: $localize`External data sharing is considered not privacy friendly. Consider stopping this practice to increase your privacy-friendliness score.`
          },
          'no external use': {
            name: $localize`No, external parties cannot access user data on our platform`,
            recommendation: $localize`No data usage by external parties is considered the most privacy friendly external data utilization level.`
          },
        }
      },
      externalDataUsers: {
        name: $localize`External data users`,
        question: $localize`Who gets access to user data collected on your platform?`,
        levels: {
          'value chain': {
            name: $localize`Sharing data with partners in your value chain is ok for most consumers.`,
            recommendation: $localize``
          },
          'platform users': {
            name: $localize`Other users of our platform, e.g., …`,
            recommendation: $localize`Sharing data with other platform users ok for most consumers.`
          },
          'anyone': {
            name: $localize`Any external party, e.g., …`,
            recommendation: $localize`Sharing data anyone is considered to be not privacy friendly. Consider restricting access to platform users or value chain partners to increase your privacy-friendliness score.`
          },
        }
      },
      dataTransferFrequency: {
        name: $localize`External data access frequency`,
        question: $localize`How can external parties access your collected customer data?`,
        levels: {
          'on request': {
            name: $localize`On request`,
            recommendation: $localize`Sharing data on a request-basis is ok for most consumers.`
          },
          'continuously': {
            name: $localize`Continuously`,
            recommendation: $localize`Continuous data sharing is considered to be not privacy friendly. Consider restricting data sharing to a on a request basis to increase your privacy-friendliness score.`
          },
        }
      },
      dataAnonymization: {
        name: $localize`External data anonymization`,
        question: $localize`You provide access to raw user data to external parties. Is the data anonymized?`,
        levels: {
          'anonymized': {
            name: $localize`User data accessed by external parties is anonymized`,
            recommendation: $localize`If you rely on using data, anonymization is at least considered to be more privacy friendly by consumers.`
          },
          'not anonymized': {
            name: $localize`User data accessed by external parties is not anonymized`,
            recommendation: $localize`Using non-anonymized data is considered to be not privacy friendly by consumers. Look into using other anonymization methods for a higher privacy-friendliness score.`
          },
        }
      },
      privacySettings: {
        name: $localize`Privacy settings`,
        question: $localize`Do your users have the option to change privacy settings on your platform?`,
        levels: {
          'control': {
            name: $localize`Yes, privacy settings to restrict access and use of data`,
            recommendation: $localize`Allowing consumers to control their privacy settings is associated with a higher privacy-friendliness score.`
          },
          'not control': {
            name: $localize`No, we do not offer privacy settings`,
            recommendation: $localize`Explore different privacy settings for a better privacy-friendliness score, e.g. allowing consumers to control their privacy settings increases the privacy-friendliness score.`
          },
        }
      },
      privacyEstimation: {
        name: $localize`Privacy estimation`,
        question: $localize`On a scale of 1 to 7, how privacy-friendly do you consider your business model?`,
        levels: {
          1: {name: 'not privacy-friendly (1)'},
          2: {name: '2'},
          3: {name: '3'},
          4: {name: '4'},
          5: {name: '5'},
          6: {name: '6'},
          7: {name: 'extremely privacy-friendly (7)'},
        }
      },
    };
  }

  private _defaultValues: ChoiceValues = {
    isPlatform: {
      'yes': null,
      'not yet': null,
      'no': null,
    },
    hasConsumers: {
      'yes': null,
      'not yet': null,
      'no': null,
    },
    usesData: {
      'yes': null,
      'no': null,
    },
    consumerLocation: {
      'europe': null,
      'north america': null,
      'other': null,
    },
    sector: {
      'primary': -2.3588,
      'energy': -0.8027,
      'trade': 0.2138,
      'transport': -2.0428,
      'services': 0.7863,
      'media': 1.3447,
      'finance': 0.867,
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
      'basicDemographicsData': 0.7955,
      'personalPreferenceData': 1.1273,
      'contactInformationData': -0.1291,
      'communityInteractionData': 0.0667,
      'financialInformationData': -0.7997,
      'secureIdentifiersData': -0.6743,
      'specialCategoriesOfPersonalData': -0.3863,
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
      'on request': 0.392,
      'continuously': -0.392,
    },
    dataAnonymization: {
      'anonymized': 0.64,
      'not anonymized': -0.64,
    },
    privacySettings: {
      'control': 1.7475,
      'not control': -1.7475,
    },
    privacyEstimation: {
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
    }
  };

  private get choiceValues(): RegionalChoiceValues {
    if (this.remoteConfig) {
      return JSON.parse(getString(this.remoteConfig, 'configuration'));
    }
    return {default: this._defaultValues};
  }

  public getRegionalChoiceValues(region?: string): ChoiceValues {
    return (region == undefined || region == 'other') ? this.choiceValues.default : this.choiceValues[region] || this.choiceValues.default;
  }

  private _defaultQuantiles: Quantiles = {
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
  };

  private get quantiles(): RegionalQuantiles {
    if (this.remoteConfig) {
      const quantiles = JSON.parse(getString(this.remoteConfig, 'quantiles'));
      if (quantiles.hasOwnProperty(0) && quantiles.hasOwnProperty(100))
        return quantiles;
    }
    return {default: this._defaultQuantiles};
  }

  public getRegionalQuantiles(region?: string): Quantiles {
    return (region == undefined || region == 'other') ? this.quantiles.default : this.quantiles[region] || this.quantiles.default;
  }

  // Misc functions
  readonly isXSmall = toSignal(this.bo.observe([Breakpoints.XSmall]).pipe(map(_ => _.matches)), {initialValue: false});

  readonly isHandset = toSignal(this.bo.observe([Breakpoints.Handset]).pipe(map(_ => _.matches)), {initialValue: false});

  readonly isTablet = toSignal(this.bo.observe([Breakpoints.Tablet]).pipe(map(_ => _.matches)), {initialValue: false});

  readonly isTabletPortrait = toSignal(this.bo.observe([Breakpoints.TabletPortrait]).pipe(map(_ => _.matches)), {initialValue: false});
}

export interface RecommenderChoices {
  [attribute: string]: string | number | null | {
    [option: string]: boolean | null
  }
}

interface ChoiceValues {
  [attribute: string]: {
    [level: string]: number | null
  }
}

interface RegionalChoiceValues {
  default: ChoiceValues,

  [region: string]: ChoiceValues
}

interface Quantiles {
  0: number,

  [quantile: number]: number,

  100: number
}

interface RegionalQuantiles {
  default: Quantiles,

  [region: string]: Quantiles
}

interface ChoiceStrings {
  [attribute: string]: {
    name: string,
    question: string,
    description?: string,
    levels: {
      [level: string]: {
        name: string,
        description?: string,
        recommendation?: string,
      }
    }
  }
}

export interface ChoiceValueAndRecommendation {
  attribute: string,
  level: string | number,
  value: number | null,
  recommendation?: string | undefined,
  changeInSum?: number | null,
  changeInScore?: number | null,
  changeInQuantile?: number | null,
}

export interface Analysis {
  choiceValues: ChoiceValueAndRecommendation[],
  sum: number,
  score: number,
  scoreRough: number, // rounded up
  quantile: number,
}

export interface URLParams {
  [name: string]: string
}
