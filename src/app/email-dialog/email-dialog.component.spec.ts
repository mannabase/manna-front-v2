import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailDialogComponent } from './email-dialog.component';

describe('EmailDialogComponent', () => {
  let component: EmailDialogComponent;
  let fixture: ComponentFixture<EmailDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmailDialogComponent]
    });
    fixture = TestBed.createComponent(EmailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
