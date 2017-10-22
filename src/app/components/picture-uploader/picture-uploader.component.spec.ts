import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PictureUploaderComponent } from './picture-uploader.component';

describe('PictureUploaderComponent', () => {
  let component: PictureUploaderComponent;
  let fixture: ComponentFixture<PictureUploaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PictureUploaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PictureUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
