import { Component } from '@angular/core';

@Component({
  selector: 'app-claim-manna',
  templateUrl: './claim-manna.component.html',
})
export class ClaimMannaComponent {
  successMessage: string | null = null;

  constructor() {}

  registerMe(): void {
    
  }

  claimManna(toClaim: any): void {
    this.successMessage = toClaim.toString();
  }
}
