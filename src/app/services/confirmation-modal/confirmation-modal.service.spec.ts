import { TestBed, inject } from '@angular/core/testing';

import { ConfirmationModalService } from './confirmation-modal.service';

describe('ConfirmationModalService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfirmationModalService]
    });
  });

  it('should be created', inject([ConfirmationModalService], (service: ConfirmationModalService) => {
    expect(service).toBeTruthy();
  }));
});
