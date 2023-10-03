import {Component, inject, OnInit} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective, NgForm,
  ValidationErrors,
  Validators
} from '@angular/forms';
import {MatStepper} from "@angular/material/stepper";
import {Router} from "@angular/router";
import {GlobalService, NavigatorChoices} from "../global.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ErrorStateMatcher} from "@angular/material/core";

@Component({
  selector: 'app-navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.scss']
})
export class NavigatorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private globalService = inject(GlobalService);
  private snackBar = inject(MatSnackBar);

  protected isXSmall$ = this.globalService.isXSmall$;
  protected isHandset$ = this.globalService.isHandset$;
  protected isTabletPortrait$ = this.globalService.isTabletPortrait$;

  protected stepperIndex: number = 0;
  protected matcher = new MyErrorStateMatcher();

  // Custom validator
  private atLeastOneSelected = (control: AbstractControl): ValidationErrors | null => {
    const values = Object.values(control.value);
    const isAtLeastOneSelected = values.some(val => val !== null && val !== false);
    return isAtLeastOneSelected ? null : {atLeastOneSelected: true};
  }

  private notNoValidator = (control: AbstractControl): ValidationErrors | null => control.value !== 'no' ? null : {notNo: true}

  // Form groups and form controls
  protected preQuestions: FormGroup<PreQuestions> = this.fb.group({
    isPlatform: new FormControl<string | null>(null, [Validators.required, this.notNoValidator]),
    hasConsumers: new FormControl<string | null>(null, [Validators.required, this.notNoValidator]),
    usesData: new FormControl<string | null>(null, [Validators.required, this.notNoValidator]),
  });
  protected platformInformation: FormGroup<PlatformInformation> = this.fb.group({
    consumerLocation: new FormControl<string | null>(null, Validators.required),
    sector: new FormControl<string | null>(null, Validators.required),
    monetization: new FormControl<string | null>(null, Validators.required),
  });
  protected platformData:FormGroup<PlatformData> = this.fb.group({
    dataSource: new FormControl<string | null>(null, Validators.required),
    dataTypes: this.fb.group({
      basicDemographicsData: new FormControl<boolean>(false),
      personalPreferenceData: new FormControl<boolean>(false),
      contactInformationData: new FormControl<boolean>(false),
      communityInteractionData: new FormControl<boolean>(false),
      financialInformationData: new FormControl<boolean>(false),
      secureIdentifiersData: new FormControl<boolean>(false),
      specialCategoriesOfPersonalData: new FormControl<boolean>(false),
    }, {validators: this.atLeastOneSelected}),
    internalDataUse: new FormControl<string | null>(null, Validators.required),
    externalDataUse: new FormControl<string | null>(null, Validators.required),
    externalDataUsers: new FormControl<string | null>(null),
    dataTransferFrequency: new FormControl<string | null>(null),
    dataAnonymization: new FormControl<string | null>(null),
  });
  protected platformPrivacy: FormGroup<PlatformPrivacy> = this.fb.group({
    privacySettings: new FormControl<string | null>(null, Validators.required),
    privacyEstimation: new FormControl<number | null>(null, Validators.required),
  });

  protected formGroup: FormGroup<NavigatorForm> = this.fb.group({
    preQuestions: this.preQuestions,
    platformInformation: this.platformInformation,
    platformData: this.platformData,
    platformPrivacy: this.platformPrivacy,
  });

  ngOnInit() {
    this.globalService.startNewForm();

    this.platformData.get('externalDataUse')?.valueChanges.subscribe(value => {
      const dataUsers = this.platformData.get('externalDataUsers');
      const frequency = this.platformData.get('dataTransferFrequency');
      const anonym = this.platformData.get('dataAnonymization');

      switch (value) {
        case 'raw data':
          anonym?.reset();
          dataUsers?.setValidators(Validators.required);
          frequency?.setValidators(Validators.required);
          anonym?.setValidators(Validators.required);
          dataUsers?.updateValueAndValidity();
          frequency?.updateValueAndValidity();
          anonym?.updateValueAndValidity();
          break;
        case 'analyzed data':
          anonym?.setValue('anonymized');
          dataUsers?.setValidators(Validators.required);
          frequency?.setValidators(Validators.required);
          anonym?.clearValidators();
          dataUsers?.updateValueAndValidity();
          frequency?.updateValueAndValidity();
          anonym?.updateValueAndValidity();
          break;
        case 'no external use':
          dataUsers?.reset();
          frequency?.reset();
          anonym?.reset();
          dataUsers?.clearValidators();
          frequency?.clearValidators();
          anonym?.clearValidators();
          dataUsers?.updateValueAndValidity();
          frequency?.updateValueAndValidity();
          anonym?.updateValueAndValidity();
          break;
        default:
          console.warn('Error: invalid value for externalDataUse', value);
      }
    });
  }

  protected readonly sectors = [
    {name: $localize`Primary Industries, Manufacturing and Production`, abbreviation: `primary`},
    {name: $localize`Energy, Utilities, Infrastructure and Environment`, abbreviation: `energy`},
    {name: $localize`Trade and Commerce`, abbreviation: `trade`},
    {name: $localize`Transportation and Logistics`, abbreviation: `transport`},
    {name: $localize`Services and Hospitality`, abbreviation: `services`},
    {name: $localize`Media, Communication, and Information`, abbreviation: `media`},
    {name: $localize`Financial and Professional Services`, abbreviation: `finance`},
    {name: $localize`Public Services and Governance`, abbreviation: `public`},
    {name: $localize`Education, Arts, and Culture`, abbreviation: `education`},
    {name: $localize`Health and Wellness`, abbreviation: `health`},
    // {name: $localize`Other Services`, abbreviation: `other`},
  ];
  protected readonly dataTypes = [
    {
      name: $localize`Basic demographics data`,
      abbreviation: `basic demographics data`,
      variable: 'basicDemographicsData'
    },
    {
      name: $localize`Personal preference data`,
      abbreviation: `personal preference data`,
      variable: 'personalPreferenceData'
    },
    {
      name: $localize`Contact information data`,
      abbreviation: `contact information data`,
      variable: 'contactInformationData'
    },
    {
      name: $localize`Community interaction data`,
      abbreviation: `community interaction data`,
      variable: 'communityInteractionData'
    },
    {
      name: $localize`Financial information data`,
      abbreviation: `financial information data`,
      variable: 'financialInformationData'
    },
    {
      name: $localize`Secure identifiers data`,
      abbreviation: `secure identifiers data`,
      variable: 'secureIdentifiersData'
    },
    {
      name: $localize`Special categories of personal data`,
      abbreviation: `special categories of personal data`,
      variable: 'specialCategoriesOfPersonalData'
    },
  ];



  protected onSubmit(): void {
    console.log(this.formGroup);
    this.openSnackBar($localize`:Snackbar:Starting analysis...`, $localize`:Snackbar:OK`)
    this.globalService.choiceData = this.reduceFormValues(this.formGroup.value as NavigatorFormValues);
    this.router.navigate([$localize`:routing:results`]).then(() => console.log('Start analysis...'));
  }

  private reduceFormValues(formValues: NavigatorFormValues): NavigatorChoices {
    return {
      ...formValues.preQuestions,
      ...formValues.platformInformation,
      ...formValues.platformData,
      ...formValues.platformPrivacy,
    }
  }

  protected onReset(stepper: MatStepper) {
    stepper.reset();
    this.formGroup.markAsUntouched();
  }

  private openSnackBar(message: string, action: string = '', duration: number = 2000) {
    this.snackBar.open(message, action, duration ? {
      duration: duration,
    } : undefined);
  }

  onStepChange() {
    setTimeout(() => {
      scroll(0, 0);
    }, 0);
  }
}

class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control?.invalid && (control.dirty || control.touched || form?.submitted));
  }
}


interface PreQuestions {
  isPlatform: FormControl<string | null>
  hasConsumers: FormControl<string | null>
  usesData: FormControl<string | null>
}

interface PreQuestionsValues {
  isPlatform: string | null
  hasConsumers: string | null
  usesData: string | null
}

interface PlatformInformation {
  consumerLocation: FormControl<string | null>
  sector: FormControl<string | null>
  monetization: FormControl<string | null>
}

interface PlatformInformationValues {
  consumerLocation: string | null
  sector: string | null
  monetization: string | null
}

interface PlatformData {
  dataSource: FormControl<string | null>
  dataTypes: FormGroup<{
    basicDemographicsData: FormControl<boolean | null>
    personalPreferenceData: FormControl<boolean | null>
    contactInformationData: FormControl<boolean | null>
    communityInteractionData: FormControl<boolean | null>
    financialInformationData: FormControl<boolean | null>
    secureIdentifiersData: FormControl<boolean | null>
    specialCategoriesOfPersonalData: FormControl<boolean | null>
  }>
  internalDataUse: FormControl<string | null>
  externalDataUse: FormControl<string | null>
  externalDataUsers: FormControl<string | null>
  dataTransferFrequency: FormControl<string | null>
  dataAnonymization: FormControl<string | null>
}

interface PlatformDataValues {
  dataSource: string | null
  dataTypes: {
    basicDemographicsData: boolean | null
    personalPreferenceData: boolean | null
    contactInformationData: boolean | null
    communityInteractionData: boolean | null
    financialInformationData: boolean | null
    secureIdentifiersData: boolean | null
    specialCategoriesOfPersonalData: boolean | null
  }
  internalDataUse: string | null
  externalDataUse: string | null
  externalDataUsers: string | null
  dataTransferFrequency: string | null
  dataAnonymization: string | null
}

interface PlatformPrivacy {
  privacySettings: FormControl<string | null>
  privacyEstimation: FormControl<number | null>
}

interface PlatformPrivacyValues {
  privacySettings: string | null
  privacyEstimation: number | null
}

interface NavigatorForm {
  preQuestions: FormGroup<PreQuestions>
  platformInformation: FormGroup<PlatformInformation>
  platformData: FormGroup<PlatformData>
  platformPrivacy: FormGroup<PlatformPrivacy>
}

interface NavigatorFormValues {
  preQuestions: PreQuestionsValues
  platformInformation: PlatformInformationValues
  platformData: PlatformDataValues
  platformPrivacy: PlatformPrivacyValues
}
