import { Component } from '@angular/core';
import { ContractService } from '../../contract.service';

@Component({
  selector: 'app-claim-manna',
  templateUrl: './claim-manna.component.html',
})
export class ClaimMannaComponent {
  successMessage: string | null = null;

  constructor(public contractService: ContractService) {}

  registerMe(): void {
    this.contractService.registerMe();
  }

  claimManna(toClaim: any): void {
    this.contractService.claimManna();
    this.successMessage = toClaim.toString();
  }
}
