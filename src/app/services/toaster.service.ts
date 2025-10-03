import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {

  constructor(
    public toastController: ToastController
  ) { }

  async presentToast( message: string, color: string, duration: number = 2000 ) {
    const toast = await this.toastController.create({
      message: message,
      position: 'top',
      color: color,
      duration: duration
    });
    toast.present();
  }
  async presentToastBottom( message: string, color: string, duration: number = 2000 ) {
    const toast = await this.toastController.create({
      message: message,
      position: 'bottom',
      color: color,
      duration: duration
    });
    toast.present();
  }
  async presentToastMiddle( message: string, color: string, duration: number = 2000 ) {
    const toast = await this.toastController.create({
      message: message,
      position: 'middle',
      color: color,
      duration: duration
    });
    toast.present();
  }

}
