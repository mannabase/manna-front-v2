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

    constructor(public metamaskBrightIdService: MetamaskBrightIdService) {
    }

    ngOnInit() {
        this.metamaskBrightIdService.checkMetamaskStatus();
    }

}
