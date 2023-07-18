import {Component, OnInit} from '@angular/core';
import {MetamaskService} from 'src/app/metamask.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  constructor(public metamaskService: MetamaskService) {
  }

  ngOnInit() {
    this.metamaskService.checkMetamaskStatus();
  }
}
