import { TestBed, inject } from '@angular/core/testing';

import { NgxMinStoreService } from './ngx-min-store.service';

describe('NgxMinStoreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgxMinStoreService]
    });
  });

  it('should be created', inject([NgxMinStoreService], (service: NgxMinStoreService) => {
    expect(service).toBeTruthy();
  }));
});
