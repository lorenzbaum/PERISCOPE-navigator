import {ApplicationConfig, importProvidersFrom, isDevMode} from '@angular/core';
import {provideRouter, TitleStrategy, withComponentInputBinding, withViewTransitions} from '@angular/router';

import {PageTitleStrategy, routes} from './app.routes';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideServiceWorker} from '@angular/service-worker';
import {getAnalytics, provideAnalytics, ScreenTrackingService} from '@angular/fire/analytics';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {getRemoteConfig, provideRemoteConfig} from '@angular/fire/remote-config';
import {MainComponent} from '../main.component';
import {environment} from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    MainComponent,
    provideRouter(
      routes,
      withViewTransitions({
          skipInitialTransition: true
      }),
      withComponentInputBinding()
    ),
    {provide: TitleStrategy, useClass: PageTitleStrategy},
    provideAnimationsAsync(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    ScreenTrackingService,
    // UserTrackingService,
    importProvidersFrom(  // TODO change this when firebase is updated to v17
      provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
      provideRemoteConfig(() => getRemoteConfig()),
      provideAnalytics(() => getAnalytics()),
      //provideStorage(() => getStorage()),
      //provideFirestore(() => getFirestore()),
    )
  ]
};
