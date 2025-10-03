import { Component, NgZone, OnInit } from '@angular/core';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthConstants } from 'src/app/config/auth-constants';
import { ShipmentService } from 'src/app/services/shipment.service';
import { StorageService } from 'src/app/services/storage.service';
import { LoadingController } from '@ionic/angular';
@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.page.html',
  styleUrls: ['./scanner.page.scss'],
})
export class ScannerPage implements OnInit {
  apiKey: string = '';
  scanStatus = false;
  shipmentData: any = [];
  deliveredStatus: string = '';
  message: string = '';
  isLoading = false;
  isSupported = false;
  barcodes: Barcode[] = [];
  checkgooglemodule: any;
  
  constructor(private alertController: AlertController,
    private readonly ngZone: NgZone,
    private router: Router,
    private shipmentService: ShipmentService,
    private storageService: StorageService,
    public loadingController: LoadingController,) { }



  ngOnInit() {

    // get the API Key
    this.storageService.get(AuthConstants.AUTH).then(res => {
      this.apiKey = res.apiKey;
    });
    this.storageService.get(AuthConstants.DELIVER_ROUTE).then(res => {
      this.deliveredStatus = res;
    });

    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });

    BarcodeScanner.removeAllListeners().then(() => {
      BarcodeScanner.addListener(
        'googleBarcodeScannerModuleInstallProgress',
        (event) => {
          this.ngZone.run(() => {
            //   console.log('googleBarcodeScannerModuleInstallProgress', event);
            const { state, progress } = event;
            /*  this.formGroup.patchValue({
                googleBarcodeScannerModuleInstallState: state,
                googleBarcodeScannerModuleInstallProgress: progress,
              });*/
            // console.log(state);
          });
        },
      );
    });
    this.isGoogleBarcodeScannerModuleAvailable();
  }
IonViewWillEnter(){
  this.scan();
}
  async presentLoading() {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Processing request...',
      duration: 5000
    });
    await loading.present();
  }

  public async installGoogleBarcodeScannerModule(): Promise<void> {
    await BarcodeScanner.installGoogleBarcodeScannerModule();
  }


  public async isGoogleBarcodeScannerModuleAvailable(): Promise<void> {

    if(this.isSupported) {
     this.checkgooglemodule  = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
    }
  

  };



  async scan(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) {
      this.presentAlert();
      return;
    }
    const { barcodes } = await BarcodeScanner.scan();
    this.barcodes.push(...barcodes);
    this.presentLoading();
    this.trackShipment(barcodes[0].rawValue);

  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  async presentAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Permission denied',
      message: 'Please grant camera permission to use the barcode scanner.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  trackShipment(shipmentNumber: any) {
    this.scanStatus = true;
    this.message = '';
    let param: any = { 'track': shipmentNumber };

    this.shipmentService.trackShipment(this.apiKey, param).subscribe({
      next:(res: any) => {
      this.scanStatus = false;
      if (res.length == 0) {
        this.message = "Shipment Number " + shipmentNumber + " not Found";
        return;
      }
      if (this.deliveredStatus === res[0].wpcargo_status.toLowerCase()) {
        this.router.navigate(['./home/view/' + res[0].ID]);
        return;
      }
      this.router.navigate(['./home/shipment/' + res[0].ID]);
      return;
    }, 
    error: err => {
      let message = "Network Issue. "
      message += err.error.message;
      this.message = message;
    }});
  }



}