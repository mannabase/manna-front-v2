import { Component, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { MetamaskBrightIdService } from 'src/app/metamask-bright-id.service';
import { TuiAlertService } from '@taiga-ui/core';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserScoreService } from '../../user-score.service';
import { serverUrl } from '../../config';
import { MetamaskState } from '../../metamask-bright-id.service';

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
  items!: string[];
  walletAddress: string | null = null;
  accountSubscription: Subscription = new Subscription();
  buttonText = 'Connect';
  loader: boolean = false;
  userScore: number | null = null;
  isScoreGreaterThan25: boolean = false;
  showScore: boolean = false; // Added property to control score visibility
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

    // Check Metamask state before subscribing to the account$
    this.metamaskService.checkMetamaskState().subscribe((metamaskState) => {
      switch (metamaskState) {
        case MetamaskState.CONNECTED:
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

          // Continue with the existing logic to check for stored score and fetch if needed
          if (storedScore && expirationTimestamp && expirationTimestamp > Date.now()) {
            this.userScore = storedScore;
          } else {
            this.refreshUserScore();
          }

          if (this.userScore !== null && this.userScore >= 0) {
            this.showScore = true;
            this.userScoreAvailable.emit(true); // Notify the parent that the user has a score
          } else {
            this.showScore = false;
            this.userScoreAvailable.emit(false); // Notify the parent that the user doesn't have a score
          }
          break;

        case MetamaskState.NOT_CONNECTED:
          // Metamask is not connected, hide the score
          this.showScore = false;
          this.buttonText = 'Connect';
          break;

        case MetamaskState.READY:
          // Metamask is ready, but we want to hide the score
          this.showScore = false;
          this.userScoreAvailable.emit(false);
          break;

        default:
          // Handle other Metamask states if needed
          break;
      }
    });
  }

  ngOnDestroy() {
    this.accountSubscription.unsubscribe();
  }

  async onSign() {
    const timeStamp = Math.floor(Number(Date.now().toString()) / 1000);

    try {
      const msg = `Verification request\naddress: ${this.walletAddress}\ntimestamp: ${timeStamp}`;

      // Use the new signMessage method
      this.metamaskService.signMessage(msg).subscribe((sign: string) => {
        console.log('Signature:', sign);
        console.log('Timestamp:', timeStamp);
        this.buttonText = 'Check Score';
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        this.loader = true;
        this.sendToServer(
          {
            signature: sign,
            user: this.walletAddress,
            timestamp: timeStamp,
          },
          'signing/gitcoinPassportScore',
          headers
        );
      });
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

  async sendToServer(data: any, path: string, headers: HttpHeaders) {
    const url = `${serverUrl}${path}`;
    try {
      data.user = data.user.toLowerCase();

      const response = await this.http.post<ServerResponse>(url, JSON.stringify(data), { headers }).toPromise();
      console.log('Server response:', response);

      if (response?.data) {
        const score = response.data.score / 1e6;
        console.log('Score:', score);
        this.alertService.open('Data sent successfully', {
        });
        this.isScoreGreaterThan25 = score > 25;
        this.userScore = score;
        this.storeUserScoreInStorage(score);
        this.userScoreService.userScore = score;
        this.showScore = true;
      }
    } catch (error) {
      console.error('Error sending data to server:', error);
      this.alertService.open('Error sending data to server', {
      });
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
    const expirationTimestamp = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem(this.SCORE_EXPIRATION_KEY, expirationTimestamp.toString());
  }

  private async refreshUserScore(): Promise<void> {
    try {
    } catch (error) {
      console.error('Error fetching score from server:', error);
    }
  }
}
