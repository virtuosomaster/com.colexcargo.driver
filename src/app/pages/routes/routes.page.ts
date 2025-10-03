import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';

import { ShipmentService } from 'src/app/services/shipment.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

import { AuthConstants } from 'src/app/config/auth-constants';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-routes',
  templateUrl: './routes.page.html',
  styleUrls: ['./routes.page.scss'],
})
export class RoutesPage implements OnInit {

  public authUser: any;
  public shipments_route: any;
  public routes: any = [];
  public search: string = '';
  public searchedList: any;
  public hasDriverRoute: boolean = false;
  public segment: any = 1;
  public segmentIcon: any = 'caret-down-circle-outline';
  public refreshDriverRouteCounter = 0;

  searchingFlag = false;
  errorMessage: any = false;

  constructor(
    private storageService: StorageService,
    private shipmentService: ShipmentService,
    private auth: AuthService,
    private router: Router,
    private toasterService: ToasterService,
    public loadingController: LoadingController
  ) { }

  ngOnInit() {
    // No need to load data here anymore
  }

  ionViewDidEnter() {
    console.log('delivery route');
    this.loadRoutes(); // This runs every time you enter the page
    this.refreshDriverRouteCounter++;
  }

  /**
   * This method fetches the latest route data from the API.
   */
  async loadRoutes() {
    await this.presentLoading();

    // Get user auth from observable or fallback to storage
    this.auth.userData$.subscribe(async (res: any) => {
      if (res?.apiKey) {
        this.authUser = res;
      } else {
        this.authUser = await this.storageService.get(AuthConstants.AUTH);
      }

      if (!this.authUser?.apiKey) {
        return;
      }

      this.shipmentService.getDriverRoute(this.authUser.apiKey).subscribe({
        next: (response: any) => {
          if (response?.status === 'success') {
            this.shipments_route = response;
            this.storageService.set(AuthConstants.DRIVER_DELIVER_ROUTE, response);
            
            this.shipmentService.routeGetObservable(AuthConstants.DRIVER_DWAYPOINTS).subscribe((res) => {
              if(res) {
                this.get_delivery_waypoints(); // Update the displayed list
              }
            });
          } else {
            this.toasterService.presentToast(response.message || "Unknown error", 'danger', 2000);
          }

          this.loadingController.dismiss();
        },
        error: err => {
          let message = "Network Issue. " + (err.error?.message || err.message || '');
          this.toasterService.presentToast(message, 'danger', 2000);
          this.loadingController.dismiss();
        }
      });
    });
  }

  get_delivery_waypoints() {
    // const waypoints = await this.storageService.get(AuthConstants.DRIVER_DWAYPOINTS);
    const waypoints = this.shipmentService.routeGet(AuthConstants.DRIVER_DWAYPOINTS);
    this.routes = waypoints ? this.remapData(waypoints) : [];
  }

  remapData(values: any) {
    return values.map((v: any, i: number) => ({ ...v, index: i + 1 }));
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Loading routes...',
      duration: 3000
    });
    await loading.present();
  }

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

    const query = this.search.trim();
    this.shipmentService.searchShipment(this.authUser.apiKey, query).subscribe({
      next: (response: any) => {
        this.errorMessage = !response ? 'No result Found' : '';
        this.searchedList = response.data;
        this.searchingFlag = false;

        this.setDate();
        this.loadingController.dismiss();
      },
      error: (err: any) => {
        let message = "Network Issue. " + (err.error?.message || '');
        this.errorMessage = message;
        this.toasterService.presentToast(this.errorMessage, 'danger', 2000);
        this.loadingController.dismiss();
      }
    });
  }

  setDate() {
    this.searchedList.forEach((item: any, key: number) => {
      if (item.shipment_history?.length) {
        this.searchedList[key]['current_date'] = item.shipment_history[0]['date'];
      }
    });
  }

  trackDetails(shipmentID: number) {
    this.router.navigate(['./home/view/' + shipmentID]);
  }

  hideSegment(y: any) {
    this.segment = y;
  }

  viewDetails(shipmentID: number) {
    this.router.navigate(['./home/shipment/' + shipmentID]);
  }

  loadData(ev: any) {
    // setTimeout(() => {
    //   this.shipmentService.getDriverRoute(this.authUser.apiKey).subscribe({
    //     next: (response: any) => {
    //       if (!response) {
    //         ev.target.complete();
    //         ev.target.disabled = true;
    //         return;
    //       }

    //       this.shipments_route = response;
    //       this.storageService.set(AuthConstants.DRIVER_DELIVER_ROUTE, response);
    //       ev.target.complete();
    //     },
    //     error: err => {
    //       let message = "Network Issue. " + (err.error?.message || '');
    //       this.toasterService.presentToast(message, 'danger', 8000);
    //     }
    //   });
    // }, 500);
  }

  onHasRoutesChanged(value: boolean) {
    this.hasDriverRoute = value;
    console.log(this.hasDriverRoute);
  }
}
