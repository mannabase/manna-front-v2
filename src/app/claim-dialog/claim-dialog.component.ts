import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-claim-dialog',
  templateUrl: './claim-dialog.component.html',
  styleUrls: ['./claim-dialog.component.scss']
})
export class ClaimDialogComponent implements OnInit {

  currentStep: number = 0;
  subscription !: Subscription;

  constructor() {
  }

  ngOnInit() {
    
  }

  ngOnDestroy() {
    this.subscription.unsubscribe(); 
  }
}
