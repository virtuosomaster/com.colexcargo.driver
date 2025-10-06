import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { AuthConstants } from '../../config/auth-constants';
import { LoadingController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { ToasterService } from '../../services/toaster.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  postData = {
    username: '',
    password: ''
  };
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService,
    public loadingController: LoadingController,
    private toasterService: ToasterService,
  ) { }

  async presentLoading() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Please wait...',
      duration: 6000
    });
    await loading.present();
  }

  validateInputs() {
    let username = this.postData.username.trim();
    let password = this.postData.password.trim();
    return (
      this.postData.username &&
      this.postData.password &&
      username.length > 0 &&
      password.length > 0
    );
  }

  ngOnInit() {
  }


  loginAction() {
    if (this.validateInputs()) {
      this.presentLoading();

      this.authService.login(this.postData).subscribe({
        next: (res: any) => {

          // Check if response is NOT an ERROR
          if (res.type != 'error') {
            // Check is User is a Client
            
            let userRoles = res.user.role_slugs || [];

            if(userRoles && Array.isArray(userRoles) && !userRoles.includes('wpcargo_driver')) {
              this.toasterService.presentToast('Not enough permission. Please try again.', 'danger');
              return;
            }

            const userData = res.user;
            userData["apiKey"] = res.api;

            //console.log(userData);
            // Storing the User data.
            //  console.log(res.api);

            // this.storageService
            //  .set(AuthConstants.AUTH, userData )
            //   .then(res => {
            //     this.router.navigate(['my-parcel']);
            //  });
            Preferences.set({
              key: AuthConstants.AUTH,
              value: JSON.stringify(userData),
            }).then(res => {
              this.router.navigate(['/home']);
            });


          } else {
            this.errorMessage = res.message;
            this.errorMessage = 'Login failed: Invalid username or password.';
            // console.log(this.errorMessage);
            this.toasterService.presentToast(this.errorMessage, 'danger');
          }

          this.loadingController.dismiss();

        },
        error: (err: any) => {
          let errortext = err.error.statusText;
          let message = "Network Issue. "
          if (errortext === 'Unknown Error') {
            message += 'Please enter email/username or password.';
          } else {
            message += err.error.message;
          }
          this.errorMessage = message;
          this.toasterService.presentToast(this.errorMessage, 'danger', 6000);
        }
      });
    } else {
      this.errorMessage = 'Please enter email/username or password.';
      this.toasterService.presentToast(this.errorMessage, 'danger', 6000);
    }
  }
}
