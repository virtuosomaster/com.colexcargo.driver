import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ShipmentService } from 'src/app/services/shipment.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { StorageService } from 'src/app/services/storage.service';

import { Browser } from '@capacitor/browser';
import { take } from 'rxjs/operators'; // <-- Add this import

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage {
  public authUser: any;
  public authUserFullname: any;
  public shipments: any;
  public page: number = 1;
  public search: string = '';
  public searchedList: any;

  searchingFlag = true;
  errorMessage: any = false;

  constructor(
    private shipmentService: ShipmentService,
    private auth: AuthService,
    private router: Router,
    private toasterService: ToasterService,
    public loadingController: LoadingController,
    private storageService: StorageService
  ) { }

  ionViewWillLeave() {
    this.shipments = null;
    this.searchedList = null;
    this.authUser = null;
    this.authUserFullname = null;
    }

  ionViewWillEnter() {
    this.loadDashboardData(); // Always refresh when entering the view
  }

  loadDashboardData() {
    this.presentLoading();

    // Subscribe once to user data
    this.auth.userData$.pipe(take(1)).subscribe((res: any) => {
      this.authUser = res;

      if (res.first_name && res.last_name) {
        this.authUserFullname = res.first_name + ' ' + res.last_name;
      } else {
        this.authUserFullname = res.username;
      }

      if (this.authUser.apiKey) {
        this.shipmentService.getShipmentsAllStatus(this.authUser.apiKey).subscribe({
          next: (response: any) => {
            this.loadingController.dismiss();
            this.shipments = response;
            this.searchingFlag = false;
          },
          error: err => {
            this.loadingController.dismiss();
            let message = "Network Issue. ";
            message += err.error?.message || '';
            this.toasterService.presentToast(message, 'danger', 6000);
          }
        });
      }
    });
  }

  viewShipment(status: any) {
    this.router.navigate(['./home/shipments/' + status]);
  }

  viewDetails(shipmentID: number) {
    this.router.navigate(['./home/shipment/' + shipmentID]);
  }

  createNewShipment() {
    this.router.navigate(['./home/create']);
  }

  // Search
  onSearchShipment() {
    this.searchShipments();
  }

  onInput() {
    this.onClear();
  }

  onClear() {
    this.searchedList = null;
    this.searchingFlag = false;
    this.errorMessage = false;
  }

  resetSearch() {
    this.searchedList = null;
    this.errorMessage = false;
    this.search = '';
  }

  searchShipments() {
    this.presentLoading();
    this.searchingFlag = true;

    let postData: any = {};
    postData.search = this.search.trim();

    this.shipmentService.searchShipment(this.authUser.apiKey, postData).subscribe({
      next: (response: any) => {
        this.errorMessage = !response ? 'No result Found' : '';
        this.searchedList = response;
        this.searchingFlag = false;

        this.setDate();
        this.loadingController.dismiss();
      },
      error: (err: any) => {
        this.loadingController.dismiss();
        let message = "Network Issue. ";
        message += err.error?.message || '';
        this.errorMessage = message;
      }
    });
  }

  setDate() {
    let ships = this.searchedList;

    ships.forEach((element: any, key: any) => {
      if (element.shipment_history && Array.isArray(element.shipment_history) && element.shipment_history.length > 0) {
        let latest = element.shipment_history[0];
        this.searchedList[key]['current_date'] = latest['date'];
      }
    });
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Please wait...',
      duration: 6000
    });
    await loading.present();
  }

  openSite() {
    Browser.open({ url: 'https://colexcargo.com/' });
  }
}
