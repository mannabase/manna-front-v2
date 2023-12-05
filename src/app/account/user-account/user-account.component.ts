import { Component, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import {
  MetamaskBrightIdService,MetamaskState,} from 'src/app/metamask-bright-id.service';
import { TuiAlertService } from '@taiga-ui/core';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserScoreService } from '../../user-score.service';
import { serverUrl,mannaChainName } from '../../config';

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
  showScore: boolean = false;
  state = MetamaskState.NOT_CONNECTED;
  MetamaskState = MetamaskState; 
  private readonly SCORE_STORAGE_KEY = 'userScore';
  private readonly SCORE_EXPIRATION_KEY = 'scoreExpiration';
  connectedToMetamask: boolean = false;
  mannaChain = mannaChainName;

  @Output() userScoreAvailable: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    readonly alertService: TuiAlertService,
    private metamaskService: MetamaskBrightIdService,
    private http: HttpClient,
    private userScoreService: UserScoreService,
    readonly metamaskBrightIdService: MetamaskBrightIdService,
  ) {}

  ngOnInit() {
    const storedScore = this.getUserScoreFromStorage();
    const expirationTimestamp = this.getScoreExpirationFromStorage();
  
    // Check if there's a stored score and it's not expired
    if (storedScore !== null && expirationTimestamp && expirationTimestamp > Date.now()) {
      this.userScore = storedScore;
      this.showScore = true;
    } else {
      this.accountSubscription = this.metamaskService.account$.subscribe((address) => {
        this.walletAddress = address;
      });
  
      this.updateState();
  
      if (this.state === MetamaskState.READY) {
        this.refreshUserScore();
      } else {
        // Metamask is not ready, hide the score
        this.showScore = false;
      }
    }
  }
  ngOnDestroy() {
    this.accountSubscription.unsubscribe();
  }

  async onSign() {
    const timeStamp = Math.floor(Number(Date.now().toString()) / 1000);

    try {
      const msg = `Verification request\naddress: ${this.walletAddress}\ntimestamp: ${timeStamp}`;
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
      this.loader = false;
    }
  }
  updateState() {
    this.metamaskBrightIdService.checkMetamaskState().subscribe({
        next: (value) => {
            console.log('Metamask state:', value);
            if (value === MetamaskState.READY) {
                this.state = value;
                this.connectedToMetamask = true; 
            } else if (
                value === MetamaskState.NOT_CONNECTED ||
                value === MetamaskState.NOT_INSTALLED
            ) {
                this.state = value;
                this.connectedToMetamask = false;
            } else {
                this.state = value;
                this.connectedToMetamask = false;
            }
        },
    });
}
  openMetamaskExtension() {
    if (typeof window.ethereum === 'undefined') {
      this.alertService
        .open(
          'Metamask is not installed. Please install Metamask and try again.',
          {
            status: 'error',
          }
        )
        .subscribe();
      window.open('https://metamask.io/');
      return;
    }

    this.metamaskBrightIdService.connect().subscribe({
      next: account => {
        this.alertService.open("Connected to account: " + account, {
          status: "success"
        }).subscribe();
        this.state = MetamaskState.CONNECTED;
        this.updateState();
      },
      error: (err) => {
        this.alertService.open("Failed to connect Metamask", {
          status: "error"
        }).subscribe();
        this.state = MetamaskState.NOT_CONNECTED;
        this.updateState();
      }
    });
  }

  switchChain() {
    this.metamaskBrightIdService.switchToMannaChain().subscribe({
      next: value => {
        this.alertService.open("Chain Switched to " + mannaChainName, {
          status: "success"
        }).subscribe();
        this.state = MetamaskState.READY;
        this.updateState();
      },
      error: err => {
        this.alertService.open("Failed to switch chain", {
          status: "error"
        }).subscribe();
      }
    });
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
        console.log('showScore',this.showScore)
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
