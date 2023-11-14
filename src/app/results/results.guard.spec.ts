import {TestBed} from '@angular/core/testing';
import {CanActivateFn} from '@angular/router';

import {resultsGuard} from './results.guard';

describe('resultsGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => resultsGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
