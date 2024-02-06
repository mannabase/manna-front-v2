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
        this.updateState(); 
        this.subscription.add(
            this.verifyService.contractScore$.subscribe((score) => {
                if (score !== null && score > 0) {
                    console.log(`Received contract score in component: ${score}`);
                    this.contractScore = score;
                    this.showScore = true
                    this.cdr.detectChanges(); 
                } else {
                    this.contractScore = score;
                    this.showScore = false;
                    this.cdr.detectChanges();
                }
            })
        );
        
        
        this.subscription.add(
            this.verifyService.threshold$.subscribe((threshold) => {
                if (threshold !== null) {
                    console.log(`Received threshold in component: ${threshold}`);
                    this.thresholdScore = threshold;
                    this.cdr.detectChanges();
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
                this.cdr.detectChanges();
            })
        );
        this.verifyService.fetchContractScore(this.walletAddress!);
        this.verifyService.fetchThreshold();
        console.log('showScore value:', this.showScore);
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
                this.verifyService.fetchContractScore(account);
                this.subscription.add(
                    this.verifyService.threshold$.subscribe((threshold) => {
                        if (threshold !== null) {
                            console.log(`Received threshold in component: ${threshold}`);
                            this.thresholdScore = threshold;
                            this.cdr.detectChanges();
                        }
                    })
                );
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
                this.updateState();
                this.verifyService.fetchContractScore(this.walletAddress!);
                this.subscription.add(
                    this.verifyService.threshold$.subscribe((threshold) => {
                        if (threshold !== null) {
                            console.log(`Received threshold in component: ${threshold}`);
                            this.thresholdScore = threshold;
                            this.cdr.detectChanges();
                        }
                    })
                );
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
        this.loader = true;
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
        this.loader = true;
        this.verifyService.sendScoreToContract(this.walletAddress!).subscribe({
            next: () => {
                this.refreshUserScore();
                this.loader = false;
                this.alertService.open('Score updated successfully.', {status: 'success', label: 'Success'}).subscribe();
                console.log('Score updated successfully.');
            },
            error: (error) => {
                this.loader = false;
                this.alertService.open('Failed to update score.', {status: 'error', label: 'Error'}).subscribe();
                console.error('Error submitting score to contract:', error);
            },
        });
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
