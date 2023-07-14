import { Component, OnInit, OnDestroy } from '@angular/core';
import { MethodsService } from 'src/app/methods.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  isConnected = false;
  isCorrectChain = false;
  private isConnectedSubscription: Subscription | undefined;
  private isCorrectChainSubscription: Subscription | undefined;

  constructor(private methodsService: MethodsService) {}

  ngOnInit() {
    this.isConnectedSubscription = this.methodsService.isConnected$.subscribe(isConnected => {
      this.isConnected = isConnected;
    });

    this.isCorrectChainSubscription = this.methodsService.isCorrectChain$.subscribe(isCorrectChain => {
      this.isCorrectChain = isCorrectChain;
    });

    this.methodsService.checkMetamaskStatus();
  }

  ngOnDestroy() {
    this.isConnectedSubscription?.unsubscribe();
    this.isCorrectChainSubscription?.unsubscribe();
  }
    async checkMetamaskStatus(): Promise<void> {
      await this.methodsService.checkMetamaskStatus();
    }
  
    async switchToIDChain(): Promise<void> {
      await this.methodsService.switchToIDChain();
    }
    async checkChain(): Promise<void> {
      await this.methodsService.checkChain();
    }
  
    async connect(): Promise<void> {
      await this.methodsService.connect();
    }
    async handleButtonClick(): Promise<void> {
      await this.methodsService.handleButtonClick();
    }
  
    async getAccountAndBalance(): Promise<void> {
      await this.methodsService.getAccountAndBalance();
    }
    async claim(): Promise<void> {
      await this.methodsService.claim();
    }
}
