import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';

import { ShipmentService } from 'src/app/services/shipment.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

import { AuthConstants } from 'src/app/config/auth-constants';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-delivered',
  templateUrl: './delivered.page.html',
  styleUrls: ['./delivered.page.scss'],
})
export class DeliveredPage implements OnInit {

  public authUser: any;
  public shipments: any;
  public page: number;
  public status: string = 'delivered';
  public search: string = '';
  public searchedList: any;

  stateFlag = false;
  loadFlag = false;
  searchingFlag = false;
  noResultFlag = false;
  isSettingsSetup = false;

  constructor(
    private storageService: StorageService,
    private shipmentService: ShipmentService,
    private auth: AuthService,
    private router: Router,
    private toasterService: ToasterService,
    public loadingController: LoadingController
  ) { }

  async presentLoading() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Please wait...',
      duration: 6000
    });
    await loading.present();
  }

  ngOnInit() {

  }

  ionViewWillEnter() {

    this.storageService.get(AuthConstants.STATUS).then(status => {
      this.isSettingsSetup = true;
    });

    //if( !this.isSettingsSetup ){
    this.auth.userData$.subscribe((res: any) => {
      if (res.apiKey) {
        this.authUser = res;
        this.shipmentService.getPODSettings(res.apiKey).subscribe((response: any) => {
          const { unrequired = [] } = response;
          this.page = 1;
          this.storageService.set(AuthConstants.STATUS, response.status);
          this.storageService.set(AuthConstants.DELIVER_ROUTE, response.route.delivered);
          this.storageService.set(AuthConstants.CANCELLED_ROUTE, response.route.cancelled);
          this.storageService.set(AuthConstants.SHIPPER_FIELDS, response.fields.shipper);
          this.storageService.set(AuthConstants.RECEIVER_FIELDS, response.fields.receiver);
          this.storageService.set(AuthConstants.UNREQUIRED_FIELDS, unrequired);
          this.storageService.set(AuthConstants.SIGN_FIELDS, response.sign_fields);
        }, err => {
          let message = "Network Issue. "
          message += err.error.message;
          this.toasterService.presentToast(message, 'danger', 6000);
        });
      }
    });
    //}

    this.search = '';
    this.shipments = [];
    this.allShipments();
  }

  setShipments() {
    this.shipmentService.userShipments$.subscribe((shipmentData: any) => {
      if (shipmentData.length) {
        this.shipments = shipmentData;
      }
    });
  }

  viewDetails(shipmentID: number) {
    this.router.navigate(['./home/view/' + shipmentID])
  }

  // Infinite Scroll
  loadData(ev: any) {
    this.page++;
    setTimeout(() => {
      this.shipmentService.pageByStatus(this.authUser.apiKey, this.page, this.status).subscribe({
        next: (response: any) => {
          if (!response) {
            ev.target.complete();
            ev.target.disabled = true;
            return;
          }
          for (const [key, value] of Object.entries(response)) {
            this.shipments.push(value);
          }
          ev.target.complete();
        },

        error: err => {
          let message = "No more data to load."
          // message += err.error.message;
          ev.target.complete();
          ev.target.disabled = true;
          this.toasterService.presentToast(message, 'danger', 6000);
        }
      });
    }, 500);
  }

  // Search method
  onSearchShipment() {
    this.loadFlag = false;
    this.searchShipments();
  }
  onInput() {
    this.onClear();
  }
  onClear() {
    this.allShipments();
  }

  // Common functions
  allShipments() {
    this.presentLoading();
    this.searchingFlag = true;
    this.noResultFlag = false;
    this.loadFlag = false;
    this.shipmentService.getShipmentByStatus(this.authUser.apiKey, this.status).subscribe({
      next: (response: any) => {
        this.page = 1;
        this.searchingFlag = false;
        if (response.length == 0) {
          this.noResultFlag = true;
        } else {
          this.loadFlag = true;
        }
        this.shipments = response;
        this.setDate();
        this.loadingController.dismiss();
      },
      error: err => {
        let message = "Network Issue. "
        message += err.error.message;
        this.toasterService.presentToast(message, 'danger', 6000);
      }
    });
  }

  setDate() {
    let ships = this.shipments;

    ships.forEach((element: any, key: any) => {

      if (element.shipment_history) {
        let latest = element.shipment_history[0];
        this.shipments[key]['current_date'] = latest['date'];
      }
    });
  }

  searchShipments() {
    this.presentLoading();

    let searchData = {
      search: '',
      status: ''
    };

    this.searchingFlag = true;
    searchData.search = this.search.trim();
    searchData.status = 'all';
    this.shipmentService.searchShipment(this.authUser.apiKey, searchData).subscribe({

      next: (res: any) => {
        this.searchingFlag = false;
        if (res.length == 0) {
          this.noResultFlag = true;
        }
        this.shipments = res;
        this.loadingController.dismiss();
      },

      error: (err: any) => {
        let message = "Network Issue. "
        message += err.error.message;
        this.toasterService.presentToast(message, 'danger', 6000);
      }
    });
  }

}
