import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { IndexGuard } from './index.guard';

describe('IndexGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => IndexGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
