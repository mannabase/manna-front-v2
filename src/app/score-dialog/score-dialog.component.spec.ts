import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreDialogComponent } from './score-dialog.component';

describe('ScoreDialogComponent', () => {
  let component: ScoreDialogComponent;
  let fixture: ComponentFixture<ScoreDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScoreDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
