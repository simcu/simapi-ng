import {TestBed} from '@angular/core/testing';

import {SimApiService} from './simapi.service';

describe('SimapiService', () => {
  let service: SimApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
