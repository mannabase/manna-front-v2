import {Component} from '@angular/core';
import {DynamicDialogConfig} from "primeng/dynamicdialog";
import {MannaService} from 'src/app/manna.service';
import {FormControl, Validators} from "@angular/forms";

@Component({
  selector: 'app-email-dialog',
  templateUrl: './email-dialog.component.html',
  styleUrls: ['./email-dialog.component.scss']
})
export class EmailDialogComponent {
  emailForm = new FormControl(null, [Validators.required, Validators.email]);
  codeForm = new FormControl(null, Validators.required);
  isCodeInputVisible = false;
  error: string | null = null;

  constructor(
    readonly dynamicDialogConfig: DynamicDialogConfig,
    public mannaService: MannaService
  ) {}

  sendEmail(): void {
    if (this.emailForm.value) {
      this.mannaService.sendEmail(this.emailForm.value)
        .subscribe((response: any) => {
          if (response) {
            this.isCodeInputVisible = true;
          }
        }, (error: any) => {
          this.error = error.message || JSON.stringify(error);
        });
    }
  }

  submitCode(): void {
    if (this.codeForm.value) {
      this.mannaService.sendCode(this.codeForm.value)
        .subscribe((response: any) => {
          if (response) {
            // do something after successful code submission, maybe close dialog
          }
        }, (error: any) => {
          this.error = error.message || JSON.stringify(error);
        });
    }
  }
  get isEmailInvalid(): boolean {
    const emailField = this.emailForm;
    return emailField.invalid && (emailField.dirty || emailField.touched);
  }
}
