import {Component, inject, OnInit} from '@angular/core';

import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {Observable} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {MatStepper} from "@angular/material/stepper";
import {map, shareReplay} from "rxjs/operators";
import {Router} from "@angular/router";
import {GlobalService} from "../global.service";
import {MatSnackBar} from "@angular/material/snack-bar";

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
  preQuestions: FormGroup = this.fb.group({
    isPlatform: new FormControl<string | null>(null, [Validators.required, this.notNoValidator]),
    hasConsumers: new FormControl<string | null>(null, [Validators.required, this.notNoValidator]),
    usesData: new FormControl<string | null>(null, [Validators.required, this.notNoValidator]),
  });
  platformInformation = this.fb.group({
    consumerLocation: new FormControl<string | null>(null, Validators.required),
    sector: new FormControl<string | null>(null, Validators.required),
    monetization: new FormControl<string | null>(null, Validators.required),
  });
  platformData = this.fb.group({
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
  platformPrivacy = this.fb.group({
    privacySettings: new FormControl<string | null>(null, Validators.required),
    privacyEstimation: new FormControl<string | null>(null, Validators.required),
  });

  formGroup: FormGroup = this.fb.group({
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
    console.log(this.formGroup.value);
    this.openSnackBar($localize`:Snackbar:Starting analysis...`, $localize`:Snackbar:OK`)
    this.globalService.saveFormData(this.formGroup.value);
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
