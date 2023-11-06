import {NgModule, isDevMode} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {MainComponent} from '../main.component';

import {ToolbarComponent} from './toolbar/toolbar.component';
import {FooterComponent} from './footer/footer.component';
import {HomeComponent} from './home/home.component';
import {RecommenderComponent} from './recommender/recommender.component';
import {ResultsComponent} from './results/results.component';

import {ReactiveFormsModule} from '@angular/forms';
import {ServiceWorkerModule} from '@angular/service-worker';

import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatDialogModule} from "@angular/material/dialog";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSliderModule} from "@angular/material/slider";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatStepperModule} from "@angular/material/stepper";
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NgOptimizedImage} from "@angular/common";
import {MatRippleModule} from "@angular/material/core";
import {ImageDialogComponent} from './image-dialog/image-dialog.component';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {getAnalytics, provideAnalytics, ScreenTrackingService} from '@angular/fire/analytics';
import {getRemoteConfig, provideRemoteConfig} from "@angular/fire/remote-config";

const firebaseConfig = {
  apiKey: "AIzaSyB_iCz3WryBku_tYGFiMUJRAaLqJUJ8X-U",
  authDomain: "periscope-6186b.firebaseapp.com",
  projectId: "periscope-6186b",
  storageBucket: "periscope-6186b.appspot.com",
  messagingSenderId: "712203487340",
  appId: "1:712203487340:web:ba17bfc0c6c8245fdcf049",
  measurementId: "G-9C99YRST5X"
};

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ToolbarComponent,
    FooterComponent,
    HomeComponent,
    RecommenderComponent,
    ResultsComponent,
    ImageDialogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatStepperModule,
    MatToolbarModule,
    MatTooltipModule,
    NgOptimizedImage,
    MatRippleModule,
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideRemoteConfig(() => getRemoteConfig()),
    provideAnalytics(() => getAnalytics()),
    //provideStorage(() => getStorage()),
    //provideFirestore(() => getFirestore()),
  ],
  providers: [
    ScreenTrackingService,
    // UserTrackingService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(matIconRegistry: MatIconRegistry) {
    matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');
  }
}
