import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingDotsComponent } from './saving-dots.component';

describe('SavingDotsComponent', () => {
  let component: SavingDotsComponent;
  let fixture: ComponentFixture<SavingDotsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingDotsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingDotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
