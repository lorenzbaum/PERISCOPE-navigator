import {Component, inject, OnInit} from '@angular/core';

import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {Observable} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {MatStepper} from "@angular/material/stepper";
import {map, shareReplay} from "rxjs/operators";
import {Router} from "@angular/router";
import {GlobalService} from "../global.service";
import {MatSnackBar} from "@angular/material/snack-bar";

type PreQuestions = {
  isPlatform: FormControl<string | null>
  hasConsumers: FormControl<string | null>
  usesData: FormControl<string | null>
}

type PreQuestionsValues = {
  isPlatform: string | null
  hasConsumers: string | null
  usesData: string | null
}

type PlatformInformation = {
  consumerLocation: FormControl<string | null>
  sector: FormControl<string | null>
  monetization: FormControl<string | null>
}

type PlatformInformationValues = {
  consumerLocation: string | null
  sector: string | null
  monetization: string | null
}

type PlatformData = {
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

type PlatformDataValues = {
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

type PlatformPrivacy = {
  privacySettings: FormControl<string | null>
  privacyEstimation: FormControl<string | null>
}

type PlatformPrivacyValues = {
  privacySettings: string | null
  privacyEstimation: string | null
}

export type NavigatorForm = {
  preQuestions: FormGroup<PreQuestions>
  platformInformation: FormGroup<PlatformInformation>
  platformData: FormGroup<PlatformData>
  platformPrivacy: FormGroup<PlatformPrivacy>
}

export type NavigatorFormValues = {
  preQuestions: PreQuestionsValues
  platformInformation: PlatformInformationValues
  platformData: PlatformDataValues
  platformPrivacy: PlatformPrivacyValues
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  private globalService = inject(GlobalService);
  private snackBar = inject(MatSnackBar);

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Handset, Breakpoints.TabletPortrait, Breakpoints.WebPortrait])
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  // Custom validator
  private atLeastOneSelected = (control: AbstractControl): ValidationErrors | null => {
    const values = Object.values(control.value);
    const isAtLeastOneSelected = values.some(val => val !== null && val !== false);
    return isAtLeastOneSelected ? null : {atLeastOneSelected: true};
  }

  private notNoValidator = (control: AbstractControl): ValidationErrors | null => control.value !== 'no' ? null : {notNo: true}

  // Form groups and form controls
  preQuestions: FormGroup<PreQuestions> = this.fb.group({
    isPlatform: new FormControl<string | null>(null, [Validators.required, this.notNoValidator]),
    hasConsumers: new FormControl<string | null>(null, [Validators.required, this.notNoValidator]),
    usesData: new FormControl<string | null>(null, [Validators.required, this.notNoValidator]),
  });
  platformInformation: FormGroup<PlatformInformation> = this.fb.group({
    consumerLocation: new FormControl<string | null>(null, Validators.required),
    sector: new FormControl<string | null>(null, Validators.required),
    monetization: new FormControl<string | null>(null, Validators.required),
  });
  platformData:FormGroup<PlatformData> = this.fb.group({
    dataSource: new FormControl<string | null>(null, Validators.required),
    dataTypes: this.fb.group({
      basicDemographicsData: new FormControl<boolean | null>(null),
      personalPreferenceData: new FormControl<boolean | null>(null),
      contactInformationData: new FormControl<boolean | null>(null),
      communityInteractionData: new FormControl<boolean | null>(null),
      financialInformationData: new FormControl<boolean | null>(null),
      secureIdentifiersData: new FormControl<boolean | null>(null),
      specialCategoriesOfPersonalData: new FormControl<boolean | null>(null),
    }, {validators: this.atLeastOneSelected}),
    internalDataUse: new FormControl<string | null>(null, Validators.required),
    externalDataUse: new FormControl<string | null>(null, Validators.required),
    externalDataUsers: new FormControl<string | null>(null),
    dataTransferFrequency: new FormControl<string | null>(null),
    dataAnonymization: new FormControl<string | null>(null),
  });
  platformPrivacy: FormGroup<PlatformPrivacy> = this.fb.group({
    privacySettings: new FormControl<string | null>(null, Validators.required),
    privacyEstimation: new FormControl<string | null>(null, Validators.required),
  });

  formGroup: FormGroup<NavigatorForm> = this.fb.group({
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

  sectors = [
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
    {name: $localize`Other Services`, abbreviation: `other`},
  ];
  dataTypes = [
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



  onSubmit(): void {
    console.log(this.formGroup);
    console.log(this.formGroup.value as NavigatorFormValues);
    this.openSnackBar($localize`:Snackbar:Starting analysis...`, $localize`:Snackbar:OK`)
    this.globalService.saveFormData(this.formGroup.value as NavigatorFormValues);
    this.router.navigate(['results']).then(() => console.log('Start analysis...'));
  }

  onReset(stepper: MatStepper) {
    stepper.reset();
    this.formGroup.markAsUntouched();
  }

  private openSnackBar(message: string, action: string = '', duration: number = 2500) {
    this.snackBar.open(message, action, duration ? {
      duration: duration,
    } : undefined);
  }
}
