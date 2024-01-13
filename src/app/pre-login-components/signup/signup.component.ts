import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../../services/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {

  signupForm!: FormGroup;
  firebaseErrorMessage: string;

  constructor(
    public authService: AuthService,
    private router: Router,
    private afAuth: AngularFireAuth,
    ) {
      this.firebaseErrorMessage = '';
     }

  ngOnInit(): void {
    this.signupForm = new FormGroup({
      username: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
      // accept-terms: new FormControl('', Validators.requiredTrue)
    });
  }

  async signup(): Promise<void> {
    if (this.signupForm.invalid) {
      return;
    }

    try {
      const result: any = await this.authService.signupUser(this.signupForm.value);
      if (result == null) {
        this.router.navigate(['/home']);
      } else if (result.isValid == false) {
        this.firebaseErrorMessage = result.message;
      }
    } catch (error: any) {
      // Handle error
    }
  }
}