import { Component, QueryList, ViewChildren } from '@angular/core';
import { Platform, IonRouterOutlet, AlertController } from '@ionic/angular';
import { AuthService } from '../app/services/auth.service';
import { APP_PAGES } from './home/home.page';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';
import { Browser } from '@capacitor/browser';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;

  //Sidemenu
  public appPages: any[] = APP_PAGES.filter(page => page.inSidemenu);

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {
    this.initializeApp();
  }
  initializeApp() {
    this.platform.ready().then(async () => {
      await EdgeToEdge.enable();  // turns on edge-to-edge mode
      // optional: set the bar colors, if you want the icons/light‑dark style
      await EdgeToEdge.setBackgroundColor({ color: "#1a1e3a" });
      this.backButtonEvent();
      SplashScreen.hide();
    });
  }

  // Alert
  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      message: 'Are you sure you want to exit?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {

          }
        }, {
          text: 'Okay',
          handler: () => {
            this.authService.logout();
            App.exitApp();
          }
        }
      ]
    });

    await alert.present();
  }

  // Hardware Back button
  backButtonEvent() {
    document.addEventListener("backbutton", () => {
      this.routerOutlets.forEach((outlet: IonRouterOutlet) => {
        let url = this.router.url;
        let splittedURL = url.split("/");
        if (outlet.canGoBack() && url === '/login') {
          this.router.navigate(['/']);
          return;
        } else if (url === '/home/dashboard' || url === '/home/accounts' || url === '/home/create') {
          this.presentAlertConfirm();
          return;
        } else {
          if (splittedURL.length >= 3) {
            let routeIndex = splittedURL[2];
            let routeName = routeIndex === 'shipments' || routeIndex === 'shipment' ? 'dashboard' : routeIndex;
            this.router.navigate(['/home/' + routeName]);
            return;
          }
        }
      });
    });
  }

  openURL = async (url: any) => {
    await Browser.open({ url: url });
  }

  //logout
  logout() {
    this.authService.logout();
  }
}
