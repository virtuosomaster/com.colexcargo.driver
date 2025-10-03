import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { ShipmentService } from 'src/app/services/shipment.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthConstants } from 'src/app/config/auth-constants';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-pick-up-route',
  templateUrl: './pick-up-route.page.html',
  styleUrls: ['./pick-up-route.page.scss'],
})
export class PickUpRoutePage implements OnInit {

  public authUser: any;
  public shipments_route: any;
  public routes: any = [];
  public search: string = '';
  public searchedList: any;
  public hasPickupRoute: boolean = false;
  public segment: any = 1;
  public refreshPickupRouteCounter = 0;

  public searchingFlag = false;
  public errorMessage: any = false;

  constructor(
    private storageService: StorageService,
    private shipmentService: ShipmentService,
    private auth: AuthService,
    private router: Router,
    private toasterService: ToasterService,
    public loadingController: LoadingController
  ) {}

  ngOnInit() {
    // No need to fetch data here
  }

  ionViewDidEnter() {
    console.log('pickup route');
    this.loadRoutes(); // Auto-refresh when page becomes active
    this.refreshPickupRouteCounter++;
  }

  async loadRoutes() {
    await this.presentLoading();

    this.auth.userData$.subscribe(async (res: any) => {
      this.authUser = res?.apiKey ? res : await this.storageService.get(AuthConstants.AUTH);

      if (!this.authUser?.apiKey) {
        this.loadingController.dismiss();
        return;
      }

      this.shipmentService.getDriverPickupRoute(this.authUser.apiKey).subscribe({
        next: (response: any) => {
          if (response?.status === 'success') {
            this.shipments_route = response;
            this.storageService.set(AuthConstants.DRIVER_DELIVER_PICKUPROUTE, response);

            // Use observable to wait for map service to complete storing waypoints
            this.shipmentService.routeGetObservable(AuthConstants.DRIVER_PWAYPOINTS).subscribe((res) => {
              if (res) {
                this.getPickupWaypoints(); // Fetch route legs from shared observable
              }
            });
          } else {
            this.toasterService.presentToast(response.message || 'Unexpected error.', 'danger', 2000);
          }

          this.loadingController.dismiss();
        },
        error: (err) => {
          const message = "Network Issue. " + (err.error?.message || err.message || '');
          this.toasterService.presentToast(message, 'danger', 2000);
          this.loadingController.dismiss();
        }
      });
    });
  }

  getPickupWaypoints() {
    const waypoints = this.shipmentService.routeGet(AuthConstants.DRIVER_PWAYPOINTS);
    this.routes = waypoints ? this.remapData(waypoints) : [];
    console.log(this.routes);
  }

  remapData(values: any) {
    return values.map((v: any, i: number) => ({ ...v, index: i + 1 }));
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Loading pickup routes...',
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
        this.searchedList = response?.data || [];
        this.setDate();
        this.searchingFlag = false;
        this.loadingController.dismiss();
      },
      error: (err: any) => {
        const message = "Network Issue. " + (err.error?.message || '');
        this.errorMessage = message;
        this.toasterService.presentToast(message, 'danger', 2000);
        this.loadingController.dismiss();
      }
    });
  }

  setDate() {
    this.searchedList.forEach((shipment: any, index: number) => {
      const latest = shipment.shipment_history?.[0];
      if (latest) {
        this.searchedList[index]['current_date'] = latest.date;
      }
    });
  }

  trackDetails(shipmentID: number) {
    this.router.navigate(['./home/view/' + shipmentID]);
  }

  viewDetails(shipmentID: number) {
    this.router.navigate(['./home/shipment/' + shipmentID]);
  }

  hideSegment(segmentValue: number) {
    this.segment = segmentValue;
  }

  onHasRoutesChanged(value: boolean) {
    this.hasPickupRoute = value;
    console.log(this.hasPickupRoute);
  }

  loadData(ev: any) {
    // Future enhancement: implement infinite scroll
  }
}
