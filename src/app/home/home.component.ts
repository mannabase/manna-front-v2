import {Component, Injector, OnInit} from '@angular/core';
import {TuiAlertService, TuiDialogService} from '@taiga-ui/core';
import {MetamaskBrightIdService} from 'src/app/metamask-bright-id.service';
import {UserClaimingState, UserService} from 'src/app/user.service';
import {PolymorpheusComponent} from "@tinkoff/ng-polymorpheus";
import {ClaimDialogComponent} from "../claim-dialog/claim-dialog.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  buttonMessageMap = new Map<UserClaimingState, string>([
    [UserClaimingState.ZERO, 'Connect Metamask'],
    [UserClaimingState.METAMASK_CONNECTED, 'Change to ID Chain'],
    [UserClaimingState.CORRECT_CHAIN, 'Verify'],
    [UserClaimingState.VERIFIED, 'Claim'],
  ])

  constructor(readonly metamaskBrightIdService: MetamaskBrightIdService,
              readonly dialogService: TuiDialogService,
              readonly injector: Injector,
              readonly alertService: TuiAlertService) {
  }

  ngOnInit() {
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
}
