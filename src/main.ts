/// <reference types="@angular/localize" />

import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';


platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => console.log('Application loaded'))
  .catch(err => console.error(err));
