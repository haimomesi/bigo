import { TestBed, inject } from '@angular/core/testing';

import { Renderer2Service } from './renderer2.service';

describe('Renderer2Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Renderer2Service]
    });
  });

  it('should be created', inject([Renderer2Service], (service: Renderer2Service) => {
    expect(service).toBeTruthy();
  }));
});
