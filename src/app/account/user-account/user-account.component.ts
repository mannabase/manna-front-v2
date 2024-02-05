import { Component, OnInit, OnDestroy, EventEmitter, Output ,Injector ,ChangeDetectorRef} from '@angular/core';
import { MetamaskBrightIdService, MetamaskState } from 'src/app/metamask-bright-id.service';
import { TuiAlertService ,TuiDialogService} from '@taiga-ui/core';
import { Subscription } from 'rxjs';
import { HttpClient, } from '@angular/common/http';
import { mannaChainName } from '../../config';
import { ContractService } from '../../contract.service';
import { MannaService } from '../../manna.service'; 
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { ScoreDialogComponent } from '../../score-dialog/score-dialog.component';
import { VerifyService,VerifyState } from 'src/app/verify.service';

interface UserScoreData {
    timestamp: number;
    score: number;
}

@Component({
    selector: 'app-user-account',
    templateUrl: './user-account.component.html',
    styleUrls: ['./user-account.component.scss'],
})

export class UserAccountComponent implements OnInit, OnDestroy {
    walletAddress: string | null = null;
    accountSubscription: Subscription = new Subscription();
    buttonText = 'Connect';
    loader: boolean = false;
    showScore: boolean = false;
    state = MetamaskState.NOT_CONNECTED;
    MetamaskState = MetamaskState;
    connectedToMetamask: boolean = false;
    mannaChain = mannaChainName;
    contractScore: number | null = null;
    thresholdScore: number | null = null;
    private subscription: Subscription = new Subscription();
    verificationState: VerifyState;

    @Output() userScoreAvailable: EventEmitter<boolean> = new EventEmitter<boolean>();
    injector: Injector | null | undefined;
    constructor(
        readonly alertService: TuiAlertService,
        private metamaskService: MetamaskBrightIdService,
        private http: HttpClient,
        readonly metamaskBrightIdService: MetamaskBrightIdService,
        private contractService: ContractService,
        private mannaService: MannaService,
        public verifyService: VerifyService,
        readonly dialogService: TuiDialogService,
        private cdr: ChangeDetectorRef,
    ) {
        this.accountSubscription = this.metamaskService.account$.subscribe((address) => {
            this.walletAddress = address;
            if (address) {
                this.verifyService.verifyUser(address);
            }
        });
        this.verificationState = VerifyState.NOT_VERIFIED;
        this.verifyService.verificationState$.subscribe(state => {
            this.verificationState = state;
        });
    }

    ngOnInit() {
        this.subscription.add(
            this.verifyService.contractScore$.subscribe((score) => {
                if (score !== null) {
                    console.log(`Received contract score in component: ${score}`);
                    this.contractScore = score;
                    this.cdr.detectChanges(); // Trigger change detection
                }
            })
        );
        
        this.subscription.add(
            this.verifyService.threshold$.subscribe((threshold) => {
                if (threshold !== null) {
                    console.log(`Received threshold in component: ${threshold}`);
                    this.thresholdScore = threshold;
                    this.cdr.detectChanges(); // Trigger change detection
                }
            })
        );
      
        this.subscription.add(
          this.verifyService.verificationState$.subscribe(state => {
            this.verificationState = state;
          })
        );

        this.subscription.add(
            this.verifyService.verificationState$.subscribe(state => {
                console.log(`Received verification state in component: ${state}`);
                this.verificationState = state;
                this.showScore = true; // Consider the logic here based on your needs
                this.cdr.detectChanges(); // Ensure UI updates
            })
        );
        this.verifyService.fetchContractScore(this.walletAddress!);
        this.verifyService.fetchThreshold();
      }

    ngOnDestroy() {
        this.accountSubscription.unsubscribe();
        this.subscription.unsubscribe();
    }     
    updateState() {
        this.metamaskBrightIdService.checkMetamaskState().subscribe({
            next: (value) => {
                console.log('Metamask state:', value)
                if (value === MetamaskState.READY) {
                    this.state = value
                    this.connectedToMetamask = true
                } else if (
                    value === MetamaskState.NOT_CONNECTED ||
                    value === MetamaskState.NOT_INSTALLED
                ) {
                    this.state = value
                    this.connectedToMetamask = false
                } else {
                    this.state = value
                    this.connectedToMetamask = false
                }
            },
        })
    }

    openMetamaskExtension() {
        if (typeof window.ethereum === 'undefined') {
            this.alertService.open('Metamask is not installed. Please install Metamask and try again.', {status: 'error'}).subscribe();
            window.open('https://metamask.io/');
            return;
        }

        this.metamaskBrightIdService.connect().subscribe({
            next: account => {
                this.alertService.open("Connected to account: " + account, {status: "success"}).subscribe();
                this.state = MetamaskState.CONNECTED;
                this.updateState();
            },
            error: (err) => {
                this.alertService.open("Failed to connect Metamask", {status: "error"}).subscribe();
                this.state = MetamaskState.NOT_CONNECTED;
                this.updateState();
            },
        });
    }

    switchChain() {
        this.metamaskBrightIdService.switchToMannaChain().subscribe({
            next: () => {
                this.alertService.open('Chain Switched to ' + mannaChainName, {status: 'success'}).subscribe();
                this.state = MetamaskState.READY;
                this.showScore = true;
            },
            error: (err) => {
                this.alertService.open('Failed to switch chain', {status: 'error'}).subscribe();
            },
        });
    }
    private refreshUserScore() {
        if (!this.walletAddress) {
            console.error('No wallet address available for fetching user score.');
            return;
        }
        this.verifyService.verificationStateSubject.subscribe(newState => {
            const score = this.verifyService['contractScore'];
            if (score !== null) {
                console.log('User score fetched:', score);
                this.showScore = true;
                this.userScoreAvailable.emit(true);
            } else {
                console.error('Error fetching score: Score is null');
            }
        });
    }
    checkUserScore() {
        if (!this.walletAddress) {
          console.error('No wallet address available.');
          return;
        }
      
        const timestamp = Math.floor(Date.now() / 1000);
        this.metamaskBrightIdService.signUserMessage().subscribe(signature => {
          if (!signature) {
            console.error('No signature received.');
            return;
          }
          this.mannaService.getGitcoinScore(this.walletAddress!, signature, timestamp).subscribe({
            next: (response) => {
              console.log('Score from server:', response.score);
              this.verifyService.setServerScore(response.score);
              this.openDialogScore();
            },
            error: (error) => console.error('Error fetching score from server:', error),
          });
        }, signError => console.error('Error signing message:', signError));
      }
      
    updateUserScore() {
        if (!this.walletAddress) {
            console.error('No wallet address available.');
            return;
        }
        this.loader = true;

        const timestamp = Math.floor(Date.now() / 1000);

        this.metamaskService.signUserMessage().subscribe(
            signature => {
                this.mannaService.getGitcoinScore(this.walletAddress!, signature, timestamp).subscribe(
                    serverResponse => {
                        this.contractService.submitUserScore(this.walletAddress!, serverResponse.data).subscribe(
                            () => {
                                console.log('Score updated successfully.');
                                this.refreshUserScore();
                                this.loader = false;
                                this.alertService.open('Score updated successfully.', {status: 'success', label: 'Success'}).subscribe();
                            },
                            error => {
                                console.error('Error submitting score to contract:', error);
                                this.loader = false;
                                this.alertService.open('Failed to update score.', {status: 'error', label: 'Error'}).subscribe();
                            }
                        );
                    },
                    error => {
                        console.error('Error sending signature to server:', error);
                        this.loader = false;
                        this.alertService.open('Failed to send signature to server.', {status: 'error', label: 'Error'}).subscribe();
                    }
                );
            },
            error => {
                console.error('Error signing message:', error);
                this.loader = false;
                this.alertService.open('Failed to sign message.', {status: 'error', label: 'Error'}).subscribe();
            }
        );
    }
    openLinkInNewTab() {
        window.open('https://passport.gitcoin.co', '_blank');
    }
    openDialogScore() {
        const score = this.verifyService.serverScore$;
        const threshold = this.verifyService.threshold$;

        console.log('Attempting to open dialog with score:', score, 'and threshold:', threshold);

        const dialogRef = this.dialogService.open(new PolymorpheusComponent(ScoreDialogComponent, this.injector), {
            data: { score, threshold },
            dismissible: true,
        });

        dialogRef.subscribe({
            next: (value: any) => {
                console.log('Dialog closed with result:', value);
            },
            error: (error: any) => {
                console.error('Error occurred while opening the dialog:', error);
            }
        });
    }
}
