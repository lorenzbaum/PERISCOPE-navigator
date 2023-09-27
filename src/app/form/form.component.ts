import {Component, inject} from '@angular/core';

import {AbstractControl, FormBuilder, ValidationErrors, Validators} from '@angular/forms';
import {Observable} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {MatStepper, StepperOrientation} from "@angular/material/stepper";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent {
  private fb = inject(FormBuilder);

  private atLeastOneSelected = (control: AbstractControl): ValidationErrors | null => {
    const values = Object.values(control.value);
    const isAtLeastOneSelected = values.some(val => val !== null && val !== false);

    return isAtLeastOneSelected ? null : {atLeastOneSelected: true};
  }

  preQuestions = this.fb.group({
    isPlatform: [null, Validators.required],
    hasConsumers: [null, Validators.required],
    usesData: [null, Validators.required],
  });
  platformInformation = this.fb.group({
    consumerLocation: [null, Validators.required],
    sector: [null, Validators.required],
    monetization: [null, Validators.required],
  });
  platformData = this.fb.group({
    dataSource: [null, Validators.required],
    dataTypes: this.fb.group({
      basicDemographicsData: [null],
      personalPreferenceData: [null],
      contactInformationData: [null],
      communityInteractionData: [null],
      financialInformationData: [null],
      secureIdentifiersData: [null],
      specialCategoriesOfPersonalData: [null],
    }, {validators: this.atLeastOneSelected}),
    internalDataUse: [null, Validators.required],
    externalDataUse: [null, Validators.required],
    externalDataUsers: [null, Validators.required],
    dataTransferFrequency: [null, Validators.required],
    dataAnonymization: [null, Validators.required],
  });
  platformPrivacy = this.fb.group({
    privacySettings: [null, Validators.required],
    privacyEstimation: [null, Validators.required],
  });

  formArray = this.fb.array([
    this.preQuestions,
    this.platformInformation,
    this.platformData,
    this.platformPrivacy,
  ]);

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
    console.log(this.formArray);
    console.log(this.formArray.value);
    alert('Thanks!');
  }

  onReset(stepper: MatStepper) {
    stepper.reset();
    //this.formArray.controls.forEach((control: AbstractControl) => {control.reset();});
  }
  stepperOrientation: Observable<StepperOrientation> = inject(BreakpointObserver)
    .observe([Breakpoints.Handset, Breakpoints.TabletPortrait, Breakpoints.WebPortrait])
    .pipe(map(({matches}) => (matches ? 'vertical' : 'horizontal')));

  // TODO remove this
  addressForm = this.fb.group({
    company: null,
    firstName: [null, Validators.required],
    lastName: [null, Validators.required],
    address: [null, Validators.required],
    address2: null,
    city: [null, Validators.required],
    state: [null, Validators.required],
    postalCode: [null, Validators.compose([
      Validators.required, Validators.minLength(5), Validators.maxLength(5)])
    ],
    shipping: ['free', Validators.required]
  });
  hasUnitNumber = false;
}
