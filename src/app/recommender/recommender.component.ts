import {ChangeDetectionStrategy, Component, computed, inject, NgZone, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  ValidationErrors,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import {MatStepper, MatStepperModule} from "@angular/material/stepper";
import {Router} from "@angular/router";
import {GlobalService, RecommenderChoices} from "../global.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ErrorStateMatcher, MatOptionModule} from "@angular/material/core";
import {MatSliderModule} from '@angular/material/slider';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {AsyncPipe} from '@angular/common';
import {MatRadioModule} from '@angular/material/radio';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-recommender',
  templateUrl: './recommender.component.html',
  styleUrl: './recommender.component.scss',
  standalone: true,
  imports: [ReactiveFormsModule, MatStepperModule, MatButtonModule, MatRadioModule, MatFormFieldModule, MatSelectModule, MatOptionModule, MatCheckboxModule, MatSliderModule, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommenderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private globalService = inject(GlobalService);
  private snackBar = inject(MatSnackBar);
  private ngZone = inject(NgZone);

  protected readonly isXSmall = this.globalService.isXSmall;
  protected readonly stepperOrientation = computed(
    () => this.globalService.isHandset() || this.globalService.isTabletPortrait() ? 'vertical' : 'horizontal');

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
  protected platformData: FormGroup<PlatformData> = this.fb.group({
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

  protected formGroup: FormGroup<RecommenderForm> = this.fb.group({
    preQuestions: this.preQuestions,
    platformInformation: this.platformInformation,
    platformData: this.platformData,
    platformPrivacy: this.platformPrivacy,
  });

  ngOnInit() {
    this.globalService.startNewForm();

    this.platformData.get('externalDataUse')!.valueChanges.subscribe(value => {
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
      }
    });
  }

  protected choiceStrings = this.globalService.choiceValues;

  protected readonly sectors = Object.keys(this.choiceStrings['sector'].levels);
  protected readonly dataTypes = Object.keys(this.choiceStrings['dataTypes'].levels)

  protected onSubmit(): void {
    this.openSnackBar($localize`:Snackbar:Starting analysis …`, $localize`:Snackbar:OK`)
    this.globalService.choiceData = this.reduceFormValues(this.formGroup.value as RecommenderFormValues);
    this.router.navigate([$localize`:routing:results`]).then(() => console.log('Start analysis...'));
  }

  private reduceFormValues(formValues: RecommenderFormValues): RecommenderChoices {
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
    this.ngZone.runOutsideAngular(()=>setTimeout(() => {
      scroll(0, 0);
    }, 0));
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

interface RecommenderForm {
  preQuestions: FormGroup<PreQuestions>
  platformInformation: FormGroup<PlatformInformation>
  platformData: FormGroup<PlatformData>
  platformPrivacy: FormGroup<PlatformPrivacy>
}

interface RecommenderFormValues {
  preQuestions: PreQuestionsValues
  platformInformation: PlatformInformationValues
  platformData: PlatformDataValues
  platformPrivacy: PlatformPrivacyValues
}
