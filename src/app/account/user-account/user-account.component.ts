import { Component, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { MetamaskBrightIdService } from 'src/app/metamask-bright-id.service';
import { TuiAlertService } from '@taiga-ui/core';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserScoreService } from '../../user-score.service';

declare let window: any;

interface ServerResponse {
  data: {
    score: number;
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
  userScore: number | null = null; // New property to store the user's score
  isScoreGreaterThan25: boolean = false; // New property to check if the score is greater than 25
  private readonly SCORE_STORAGE_KEY = 'userScore';
  private readonly SCORE_EXPIRATION_KEY = 'scoreExpiration';

  @Output() userScoreAvailable: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    readonly alertService: TuiAlertService,
    private metamaskService: MetamaskBrightIdService,
    private http: HttpClient,
    private userScoreService: UserScoreService, 
  ) {}

  ngOnInit() {
    // Check for stored user score on component initialization
    this.userScore = this.getUserScoreFromStorage();
    const storedScore = this.getUserScoreFromStorage();
    const expirationTimestamp = this.getScoreExpirationFromStorage();
    if (this.userScore !== null && this.userScore >= 0) {
      this.userScoreService.userScore = this.userScore;
    }
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
    if (storedScore && expirationTimestamp && expirationTimestamp > Date.now()) {
      // If the stored score is not expired, use it
      this.userScore = storedScore;
    } else {
      // Otherwise, fetch the score from the server
      this.refreshUserScore();
    }
    if (this.userScore !== null && this.userScore >= 0) {
      this.userScoreAvailable.emit(true); // Notify the parent that the user has a score
    } else {
      this.userScoreAvailable.emit(false); // Notify the parent that the user doesn't have a score
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
        const score = response.data.score / 1e6;
        console.log('Score:', score);

        // Show success message
        this.alertService.open('Data sent successfully', {
          // status: TuiStatus.Success,
        });

        // Check if the score is greater than 25
        this.isScoreGreaterThan25 = score > 25;

        // Set user's score
        this.userScore = score;

        // Store user score in localStorage
        this.storeUserScoreInStorage(score);
        this.userScoreService.userScore = score;
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

  private getUserScoreFromStorage(): number | null {
    return parseFloat(localStorage.getItem(this.SCORE_STORAGE_KEY) || 'null');
  }

  private getScoreExpirationFromStorage(): number | null {
    return parseFloat(localStorage.getItem(this.SCORE_EXPIRATION_KEY) || 'null');
  }

  private storeUserScoreInStorage(score: number): void {
    localStorage.setItem(this.SCORE_STORAGE_KEY, score.toString());

    // Set expiration time to one week from now
    const expirationTimestamp = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem(this.SCORE_EXPIRATION_KEY, expirationTimestamp.toString());
  }

  private async refreshUserScore(): Promise<void> {
    // Fetch the score from the server and handle the response
    try {
      // ... (fetching score from the server logic)
    } catch (error) {
      // Handle error fetching score
      console.error('Error fetching score from server:', error);
    }
  }
}

class Card {
  name?: string;
  image?: string;
  price?: number;
}
