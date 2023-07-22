import {Component, OnInit} from '@angular/core';
import {MetamaskBrightIdService} from 'src/app/metamask-bright-id.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

    constructor(public metamaskService: MetamaskBrightIdService) {
    }

    ngOnInit() {
        this.metamaskService.checkMetamaskStatus();
    }

}
