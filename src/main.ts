/// <reference types="@angular/localize" />

import {bootstrapApplication} from '@angular/platform-browser';
import {appConfig} from './app/app.config';
import {AppComponent} from './app/app.component';
import {MainComponent} from './main.component';

console.log('Loading application...');
bootstrapApplication(AppComponent, appConfig)
  .then(() => console.log('Application loaded.'))
  .catch(err => console.error(err, MainComponent));  // Make sure MainComponent is imported for translation.
