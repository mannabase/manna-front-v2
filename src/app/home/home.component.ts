import {Component, OnInit} from '@angular/core';
import {MetamaskBrightIdService} from 'src/app/metamask-bright-id.service';
import { UserService, UserState } from 'src/app/user.service';
import { switchMap } from 'rxjs/operators';
import { of, from } from 'rxjs';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

    constructor(public metamaskBrightIdService: MetamaskBrightIdService,
                private userService: UserService) {
    }
    
    ngOnInit() {
        this.metamaskBrightIdService.checkMetamaskStatus();
        this.userService.userState$.subscribe(userState => {
          console.log('Current User State:', userState);
        });
    }
    handleButtonClick(): void {
        this.userService.userState$.pipe(
          switchMap(state => {
            switch (state) {
              case UserState.NotConnectedToMetamask:
                return from(this.metamaskBrightIdService.connect());
              case UserState.WrongChain:
                return of(undefined);
              case UserState.NotVerified:
                return of(undefined);
              case UserState.Email:
                return of(undefined);
              case UserState.ReadyToClaim:
                return from(this.metamaskBrightIdService.tryClaim());
              default:
                return of(undefined);
            }
          })
        ).subscribe();
      }
      getUserStateMessage(): string {
        switch (this.userService.userState$.value) {
          case UserState.NotConnectedToMetamask:
            return 'Connect MetaMask';
          case UserState.WrongChain:
            return 'Change to ID Chain';
          case UserState.NotVerified:
            return 'Verify';
          case UserState.Email:
            return 'Submit Email';
          case UserState.ReadyToClaim:
            return 'Claim';
          default:
            return '';
        }
      }
}
