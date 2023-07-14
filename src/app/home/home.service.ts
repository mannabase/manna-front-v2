import { Injectable } from '@angular/core';
import { WalletComponent } from '../account/wallet/wallet.component';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  constructor(private walletComponent: WalletComponent) {}

  handleButtonClick(): void {
    this.walletComponent.handleButtonClick();
  }
}
