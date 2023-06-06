import { Component,Input } from '@angular/core';

@Component({
  selector: 'app-intro-card',
  templateUrl: './intro-card.component.html',
  styleUrls: ['./intro-card.component.scss']
})
export class IntroCardComponent {

  @Input() title!: string;
  @Input() body!: string;
  @Input() link!: string;
  @Input() icon!: string;
}
