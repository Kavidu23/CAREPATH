import { TestBed } from '@angular/core/testing';

import { RequestQueueServiceService } from './request-queue.service.service';

describe('RequestQueueServiceService', () => {
  let service: RequestQueueServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestQueueServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
