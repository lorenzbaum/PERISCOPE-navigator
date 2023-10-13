import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";

@Injectable({providedIn: 'root'})
export class GlobalService {
  readonly version: string = 'v0.5.1';
  readonly title: string = $localize`:App name|Name of the App:Privacy-friendly Business Models`;
  readonly shortTitle: string = $localize`:Short app name|Short name of the App:PBM`;

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
  getAnalysis(choiceData: NavigatorChoices | undefined): Analysis | undefined {
    if (choiceData) {
      let choiceValuesAndRecommendations: ChoiceValueAndRecommendation[] = this.calculateValuesAndRecommendations(choiceData, this.choiceValues);
      const sum = this.calculateValueSum(choiceValuesAndRecommendations);
      const score = this.calculateScore(sum);
      const quantile = this.findClosestQuantile(sum);
      choiceValuesAndRecommendations = this.calculateRecommendationEffects(choiceValuesAndRecommendations, sum, score, quantile);
      choiceValuesAndRecommendations = this.sortAndFilterRecommendations(choiceValuesAndRecommendations);
      return {
        choiceValues: choiceValuesAndRecommendations,
        sum: Math.round(1000000 * sum) / 1000000,
        score: Math.round(500 * score) / 100,
        scoreRough: Math.ceil(score),
        quantile: Math.round(1000000 * quantile) / 1000000,
      };
    } else {
      return undefined;
    }
  }

  private calculateValuesAndRecommendations(choiceData: NavigatorChoices,
                                            choiceValues: ChoiceValues): ChoiceValueAndRecommendation[] {
    let result: ChoiceValueAndRecommendation[] = [];
    for (let attribute in choiceData) {
      const currentChoice = choiceData[attribute];
      const choiceValue = choiceValues[attribute]
      if (currentChoice && choiceValue) {
        if (typeof currentChoice === 'object') { // check boxes
          for (let level in currentChoice) {
            if (currentChoice[level] == true)
              result.push({
                attribute: attribute,
                level: level,
                value: choiceValue.levels[level].value,
                recommendation: choiceValue.levels[level].recommendation,
              });
          }
        } else { // normal select
          result.push({
            attribute: attribute,
            level: currentChoice,
            value: choiceValue.levels[currentChoice].value,
            recommendation: choiceValue.levels[currentChoice].recommendation,
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

  private calculateScore(sum: number) {
    return (sum - this.quantiles[0]) / (this.quantiles[100] - this.quantiles[0]);
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

  private calculateRecommendationEffects(choiceValues: ChoiceValueAndRecommendation[], sum: number, score: number, quantile: number): ChoiceValueAndRecommendation[] {
    return choiceValues.map((choiceValue, index) => {
      let changeInSum: number | null = null;
      let changeInScore: number | null = null;
      let changeInQuantile: number | null = null;
      let backupValue = choiceValue.value;
      if (backupValue) {
        // set value to null
        const secondBestValue = this.getSecondBestLevelValue(choiceValue.attribute, choiceValue.level) || null;
        debugger;
        const newSum = Math.round(1000000 * (sum - backupValue + secondBestValue!)) / 1000000;
        changeInSum = Math.round(1000000 * (newSum - sum)) / 1000000;
        changeInScore = Math.round(500 * (this.calculateScore(newSum) - score)) / 100;
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

  private getSecondBestLevelValue(attribute: string, level: string | number): number | null {
    const valueObject = this.choiceValues[attribute].levels;
    const levelValue = valueObject[level].value;
    if (valueObject && levelValue) {
      let sortedValues = Object.entries(valueObject).sort((a, b) => {
        return a[1].value && b[1].value ? a[1].value - b[1].value : !a[1].value ? +Infinity : -Infinity;
      });
      sortedValues = sortedValues.filter(level => level[1].value !== null && level[1].value >= levelValue);
      if (sortedValues.length > 1)
        return sortedValues[1][1].value;
      else
        return sortedValues[0] ? sortedValues[0][1].value : null;
    }
    return null;
  }

  get choiceValues(): ChoiceValues {
    return {
      isPlatform: {
        name: $localize`Online platform`,
        question: $localize`Is your business an online platform or does it have the potential to be one?`,
        levels: {
          'yes': {name: $localize`Yes`, value: null},
          'not yet': {name: $localize`Not yet, but has the potential`, value: null},
          'no': {name: $localize`No`, value: null},
        }
      },
      hasConsumers: {
        name: $localize`Platform has consumers`,
        question: $localize`Is your platform used by individual end users (consumers) or does it have the potential to be used by them?`,
        levels: {
          'yes': {name: $localize`Yes`, value: null},
          'not yet': {name: $localize`Not yet, but we plan to`, value: null},
          'no': {name: $localize`No`, value: null},
        }
      },
      usesData: {
        name: $localize`Platform relies on data`,
        question: $localize`Does your platform rely on user data to generate value for your users?`,
        levels: {
          'yes': {name: $localize`Yes`, value: null},
          'no': {name: $localize`No`, value: null},
        }
      },
      consumerLocation: {
        name: $localize`Consumer location`,
        question: $localize`Where are most consumers of your platform located?`,
        levels: {
          'europe': {name: $localize`Europe`, value: null},
          'north america': {name: $localize`North America`, value: null},
          'other': {name: $localize`Other`, value: null}
        }
      },
      sector: {
        name: $localize`Sector`,
        question: $localize`Please select the sector of your platform.`,
        levels: {
          'primary': {
            value: -2.3588,
            name: $localize`Primary Industries, Manufacturing and Production`,
            recommendation: $localize`Pivoting to different sectors is not trivial. However, consider switching to other sectors for a higher privacy-friendliness score.`
          },
          'energy': {
            value: -0.8027,
            name: $localize`Energy, Utilities, Infrastructure and Environment`,
            recommendation: $localize`Pivoting to different sectors is not trivial. However, explore alternative sectors to improve your privacy-friendliness score.`
          },
          'trade': {
            value: 0.2138,
            name: $localize`Trade and Commerce`,
            recommendation: $localize`Your sector is considered more privacy-friendly than others. Pivoting to different sectors is not trivial. However, look into different sectors to enhance your privacy-friendliness score.`
          },
          'transport': {
            value: -2.0428,
            name: $localize`Transportation and Logistics`,
            recommendation: $localize`Pivoting to different sectors is not trivial. However, investigate other sectors for a better privacy-friendliness score.`
          },
          'services': {
            value: 0.7863,
            name: $localize`Services and Hospitality`,
            recommendation: $localize`Your sector is considered more privacy-friendly than others. Pivoting to different sectors is not trivial. However, check out different sectors to boost your privacy-friendliness score.`
          },
          'media': {
            value: 1.3447,
            name: $localize`Media, Communication, and Information`,
            recommendation: $localize`Your sector is considered more privacy-friendly than others. Pivoting to different sectors is not trivial. However, consider alternative sectors to increase your privacy-friendliness score.`
          },
          'finance': {
            value: 0.8670,
            name: $localize`Financial and Professional Services`,
            recommendation: $localize`Your sector is considered more privacy-friendly than others. Pivoting to different sectors is not trivial. However, explore different sectors for a higher privacy-friendliness score.`
          },
          'public': {
            value: -0.4967,
            name: $localize`Public Services and Governance`,
            recommendation: $localize`Look into other sectors to improve your privacy-friendliness score.`
          },
          'education': {
            value: 1.1406,
            name: $localize`Education, Arts, and Culture`,
            recommendation: $localize`Pivoting to different sectors is not trivial. However, consider switching to other sectors for a better privacy-friendliness score.`
          },
          'health': {
            value: 1.3486,
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
            value: 0.2485,
            name: $localize`Direct monetization of platform users (consumers)`,
            recommendation: $localize`Direct monetization is perceived to be the most privacy friendly monetization strategy by consumers.`
          },
          'direct monetization other market side': {
            value: -0.1964,
            name: $localize`Direct monetization from other market side (businesses)`,
            recommendation: $localize`Consider different monetization approaches to improve your privacy-friendliness score, e.g., direct monetization is associated with a higher privacy-friendliness score.`
          },
          'indirect monetization': {
            value: -0.0521,
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
            value: 0.5489,
            name: $localize`Collect only internal data, e.g., …`,
            recommendation: $localize``
          },
          'internal + public data': {
            value: -0.1736,
            name: $localize`Collect internal data and combine it with publicly available data, e.g., …`,
            recommendation: $localize`Consider if public available data is really necessary for your business model. Using internal data only increases the privacy-friendliness score with consumers.`
          },
          'internal + public + external data provider': {
            value: -0.3753,
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
            value: 0.7955,
            name: $localize`Basic demographics data`,
            recommendation: $localize`Explore different data types for a higher privacy-friendliness score, e.g., only personal preference data is considered to be more privacy friendly by most consumers.`
          },
          'personalPreferenceData': {
            value: 1.1273,
            name: $localize`Personal preference data`,
            recommendation: $localize`Personal preference data is considered to be the most privacy-friendly data type.`
          },
          'contactInformationData': {
            value: -0.1291,
            name: $localize`Contact information data`,
            recommendation: $localize`Contact information data has a negative effect on your privacy-friendliness score. Consider forgoing this information if not needed.`
          },
          'communityInteractionData': {
            value: 0.0667,
            name: $localize`Community interaction data`,
            recommendation: $localize`Community interaction data is considered to be a relatively privacy-friendly data type.`
          },
          'financialInformationData': {
            value: -0.7997,
            name: $localize`Financial information data`,
            recommendation: $localize`Consider dispensing the use of financial information if possible, as it negatively affects your privacy-friendliness score.`
          },
          'secureIdentifiersData': {
            value: -0.6743,
            name: $localize`Secure identifiers data`,
            recommendation: $localize`Re-consider the need for secure identifiers data, as is negatively affects the privacy-friendliness score of your business model.`
          },
          'specialCategoriesOfPersonalData': {
            value: -0.3863,
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
            value: 0.0245,
            name: $localize`We use user data for personalization and to improve user experience.`,
            recommendation: $localize`Internal data use to personalize user experience is ok for most consumers.`
          },
          'business operations': {
            value: -0.0245,
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
            value: -1.8814,
            name: $localize`Yes, access to raw user data`,
            recommendation: $localize`Look into different levels of external data utilization for a higher privacy-friendliness score, e.g., at least sharing analyzed data only or do not allow external usage of data.`
          },
          'analyzed data': {
            value: -0.7259,
            name: $localize`Yes, access to analyzed or aggregated user data`,
            recommendation: $localize`External data sharing is considered not privacy friendly. Consider stopping this practice to increase your privacy-friendliness score.`
          },
          'no external use': {
            value: 2.6074,
            name: $localize`No, external parties cannot access user data on our platform`,
            recommendation: $localize`No external data usage is considered to be the most privacy friendly external data utilization level.`
          },
        }
      },
      externalDataUsers: {
        name: $localize`External data users`,
        question: $localize`Who gets access to user data collected on your platform?`,
        levels: {
          'value chain': {
            value: 0.6957,
            name: $localize`Sharing data with partners in your value chain is ok for most consumers.`,
            recommendation: $localize``
          },
          'platform users': {
            value: 0.5414,
            name: $localize`Other users of our platform, e.g., …`,
            recommendation: $localize`Sharing data with other platform users ok for most consumers.`
          },
          'anyone': {
            value: -1.2371,
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
            value: 0.3920,
            name: $localize`On request`,
            recommendation: $localize`Sharing data on a request-basis is ok for most consumers.`
          },
          'continuously': {
            value: -0.3920,
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
            value: 0.6400,
            name: $localize`User data accessed by external parties is anonymized`,
            recommendation: $localize`If you rely on using data, anonymization is at least considered to be more privacy friendly by consumers.`
          },
          'not anonymized': {
            value: -0.6400,
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
            value: 1.7475,
            name: $localize`Yes, privacy settings to restrict access and use of data`,
            recommendation: $localize`Allowing consumers to control their privacy settings is associated with a higher privacy-friendliness score.`
          },
          'not control': {
            value: -1.7475,
            name: $localize`No, we do not offer privacy settings`,
            recommendation: $localize`Explore different privacy settings for a better privacy-friendliness score, e.g. allowing consumers to control their privacy settings increases the privacy-friendliness score.`
          },
        }
      },
      privacyEstimation: {
        name: $localize`Privacy estimation`,
        question: $localize`On a scale of 1 to 7, how privacy-friendly do you consider your business model?`,
        levels: {
          1: {name: 'not privacy-friendly (1)', value: null},
          2: {name: '2', value: null},
          3: {name: '3', value: null},
          4: {name: '4', value: null},
          5: {name: '5', value: null},
          6: {name: '6', value: null},
          7: {name: 'extremely privacy-friendly (7)', value: null},
        }
      },
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

interface ChoiceValues {
  [attribute: string]: {
    name: string,
    question: string,
    description?: string,
    levels: {
      [level: string]: {
        value: number | null,
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
