import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxMinStoreComponent } from './ngx-min-store.component';

describe('NgxMinStoreComponent', () => {
  let component: NgxMinStoreComponent;
  let fixture: ComponentFixture<NgxMinStoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxMinStoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxMinStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
