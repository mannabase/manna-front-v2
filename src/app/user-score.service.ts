import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserScoreService {
  private _userScore: number | null = null;
  userScoreAvailable: EventEmitter<boolean> = new EventEmitter<boolean>();

  get userScore(): number | null {
    return this._userScore;
  }

  set userScore(score: number | null) {
    this._userScore = score;
    this.userScoreAvailable.emit(score !== null && score >= 0);
  }
}
