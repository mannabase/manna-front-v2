import { Component, OnDestroy, OnInit } from '@angular/core';
import { MetamaskBrightIdService } from 'src/app/metamask-bright-id.service';
import { TuiAlertService, } from '@taiga-ui/core';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

declare let window: any;

interface ServerResponse {
  data: {
    score: number;
    // Add other properties as needed
  };
}

@Component({
  selector: 'app-user-account',
  templateUrl: './user-account.component.html',
  styleUrls: ['./user-account.component.scss']
})
export class UserAccountComponent implements OnInit, OnDestroy {
  cards: Card[] = [];
  items!: string[];
  walletAddress: string | null = null;
  accountSubscription: Subscription = new Subscription();
  buttonText = 'Connect';
  loader: boolean = false;

  constructor(
    readonly alertService: TuiAlertService,
    private metamaskService: MetamaskBrightIdService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.accountSubscription = this.metamaskService.account$.subscribe((address) => {
      this.walletAddress = address;
    });

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        this.updateButtonText(accounts);
      });
    } else {
      console.error('Metamask not detected.');
    }
  }

  ngOnDestroy() {
    this.accountSubscription.unsubscribe();
  }

  async onConnect() {
    const timeStamp = Math.floor(Number(Date.now().toString()) / 1000);
   

    try {
      const from = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const msg = `Verification request\naddress: ${from[0]}\ntimestamp: ${timeStamp}`;
      const sign = await window.ethereum.request({
        method: 'personal_sign',
        params: [msg, from[0], timeStamp],
      });

      console.log('Signature:', sign);
      console.log('Timestamp:', timeStamp);

      this.buttonText = 'Check Score';

      // Set Content-Type header
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

      // Show loader before sending data
      this.loader = true;

      await this.sendToServer(
        {
          signature: sign,
          user: from[0],
          timestamp: timeStamp,
        },
        'https://mannatest.hedgeforhumanity.org/backend/signing/gitcoinPassportScore',
        headers
      );
    } catch (error) {
      console.error('Error connecting or sending data to server:', error);
    } finally {
      // Hide loader after data is sent or on error
      this.loader = false;
    }
  }

  private updateButtonText(accounts: string[]) {
    this.buttonText = accounts.length > 0 ? 'Check Score' : 'Connect';
  }

  async sendToServer(data: any, url: string, headers: HttpHeaders) {
    try {
      data.user = data.user.toLowerCase();
  
  
      // Show loader
      // const loader = this.alertService.showLoader('Sending data to the server...');
  
      const response = await this.http.post<ServerResponse>(url, JSON.stringify(data), { headers }).toPromise();
  
      // Close loader on success
      // loader.close();
  
      console.log('Server response:', response);
  
      if (response?.data) {
        console.log('Score:', response.data.score / 1e6);
  
        // Show success message
        this.alertService.open('Data sent successfully', {
          // status: TuiStatus.Success,
        });
      }
    } catch (error) {
      console.error('Error sending data to server:', error);
  
      // Close loader on error
      // loader.close();
  
      // Show error message
      this.alertService.open('Error sending data to server', {
        // status: TuiStatus.Error,
      });
  
      // Handle specific errors or show user-friendly messages here
    }
  }
}

class Card {
  name?: string;
  image?: string;
  price?: number;
}
