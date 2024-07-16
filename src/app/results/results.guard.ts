import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {GlobalService} from '../global.service';

export const resultsGuard: CanActivateFn = (route, state) => {
  return inject(GlobalService).choiceData ? true : inject(Router).parseUrl(``);
}
