import {Component, Injector, OnInit} from '@angular/core';
import {MetamaskBrightIdService} from 'src/app/metamask-bright-id.service';
import {MannaService} from 'src/app/manna.service';
import {UserClaimingState, UserService} from "../../user.service";
import {ethers} from 'ethers';
import {TuiAlertService, TuiDialogService} from "@taiga-ui/core";
import {PolymorpheusComponent} from "@tinkoff/ng-polymorpheus";
import {ClaimDialogComponent} from "../../claim-dialog/claim-dialog.component";

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
})
export class WalletComponent implements OnInit {
  balance: string | null = null;
  showWalletPage = false;
  buttonMessageMap = new Map<UserClaimingState, string>([
    [UserClaimingState.ZERO, 'Connect Metamask'],
    [UserClaimingState.METAMASK_CONNECTED, 'Change to ID Chain'],
    [UserClaimingState.CORRECT_CHAIN, 'Verify'],
    [UserClaimingState.VERIFIED, 'Enter email'],
    [UserClaimingState.READY, 'Claim'],
  ])

  constructor(readonly metamaskBrightIdService: MetamaskBrightIdService, readonly dialogService: TuiDialogService,
              readonly injector: Injector, readonly userService: UserService) {
  }

  ngOnInit() {
    this.metamaskBrightIdService.balance$.subscribe(
      balance => {
        this.balance = balance ? ethers.utils.formatEther(balance) : null;
      }
    );
    this.metamaskBrightIdService.loadBalance();
  }

  openClaimDialog() {
    this.dialogService.open<number>(
      new PolymorpheusComponent(ClaimDialogComponent, this.injector),
      {
        dismissible: true,
      },
    ).subscribe({
      next: value => {

      }
    })
  }
  toggleWalletPage() {
    this.showWalletPage = !this.showWalletPage;
  }
}
