import { Component, Output, EventEmitter} from '@angular/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { JwtService } from '../../../auth/jwt/jwt.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  imports: [InputTextModule, ReactiveFormsModule, ButtonModule, FloatLabelModule, TooltipModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent {
  @Output() modeChanged = new EventEmitter<boolean>();
  @Output() errorOccurred = new EventEmitter<number>();
  @Output() successfullLogin = new EventEmitter<number>();

  changeToRegisterMode(value: boolean) {
    this.modeChanged.emit(value);
  }
  
  loginErrorOccurred(status: number) {
    this.errorOccurred.emit(status);
  }

  emitLoginSuccess(status: number) {
    this.errorOccurred.emit(status);
  }

  loginForm = new FormGroup ({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  constructor(private jwtService: JwtService, private router: Router) {}

  // sendLoginRequest() {
  //   this.loginService.sendLoginRequest({
  //     username: this.loginForm.value.username ?? '',
  //     password: this.loginForm.value.password ?? ''
  //   }).subscribe(response => {
  //     console.log(response);
  //   });
  // }

  sendLoginRequest() {
    this.jwtService.sendLoginRequest({
      username: this.loginForm.value.username ?? '',
      password: this.loginForm.value.password ?? ''
    }).subscribe({
      next:(response) => {
        this.jwtService.setTokens({accessToken: response.token, refreshToken: response.refreshTokenId, username: response.username})
        window.location.reload()
      }, error: (error) => {
        this.loginErrorOccurred(error.status);
      }
    })
  }
}