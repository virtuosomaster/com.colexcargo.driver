import { Component, OnInit, OnDestroy } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { ShipmentService } from 'src/app/services/shipment.service';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthConstants } from 'src/app/config/auth-constants';
import { ToasterService } from 'src/app/services/toaster.service';
import { Location } from '@angular/common';
import { Subscription, forkJoin, Observable, of } from 'rxjs';
import { take, catchError, switchMap } from 'rxjs/operators';

// Define interfaces as needed
interface PodSettingsResponse {
  status: any;
  route: {
    delivered: any;
    cancelled: any;
  };
  fields: {
    shipper: any;
    receiver: any;
  };
  sign_fields: any;
  unrequired?: any[];
}

interface Shipment {
  // Define shipment properties here if known
  [key: string]: any;
}

@Component({
  selector: 'app-shipments',
  templateUrl: './shipments.page.html',
  styleUrls: ['./shipments.page.scss'],
})
export class ShipmentsPage implements OnInit, OnDestroy {
  public status: string = '';
  public authUser: any;
  public shipments: Shipment[] = [];
  public currentDate: Date = new Date();
  public page: number = 1;
  public search: string = '';
  public searchedList: Shipment[] | null = null;
  public shipments_route: any;
  public shipment_charge: number = 0.00;

  public stateFlag = false;
  public loadFlag = false;
  public searchingFlag = false;
  public noResultFlag = false;
  public isSettingsSetup = false;
  public errorMessage: string = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private shipmentService: ShipmentService,
    private auth: AuthService,
    private router: Router,
    private toasterService: ToasterService,
    public loadingController: LoadingController,
    private _location: Location
  ) {}

  ngOnInit() {
    // Use take(1) here to avoid leaking subscription
    const paramSub = this.activatedRoute.paramMap.pipe(take(1)).subscribe(data => {
      this.status = data.get('status') ?? '';
      this.loadShipmentsData();
    });
    this.subscriptions.push(paramSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async ionViewWillEnter() {
    const loading = await this.presentLoading();
    this.loadShipmentsData()
      .catch(err => {
        this.handleError(err, 'Failed to load shipments on view enter');
      })
      .finally(() => {
        loading.dismiss();
      });
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      spinner: 'circles',
      message: 'Loading shipments...',
      duration: 6000
    });
    await loading.present();
    return loading;
  }

  loadShipmentsData(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storageService.get(AuthConstants.STATUS).then(status => {
        this.isSettingsSetup = true;
      }).catch(() => {
        this.isSettingsSetup = false;
      });

      const authSub = this.auth.userData$.pipe(
        take(1),
        switchMap((res: any) => {
          if (res?.apiKey) {
            this.authUser = res;
            // forkJoin for parallel requests
            return forkJoin({
              shipments: this.shipmentService.pageByStatus(res.apiKey, this.page, this.status).pipe(
                catchError(err => {
                  this.handleError(err, 'Failed to fetch shipments');
                  return of([]);
                })
              ),
              podSettings: this.shipmentService.getPODSettings(res.apiKey).pipe(
                catchError(err => {
                  this.handleError(err, 'Failed to fetch POD settings');
                  return of(null);
                })
              )
            });
          } else {
            return of({ shipments: [], podSettings: null });
          }
        })
      ).subscribe({
        next: ({ shipments, podSettings }) => {
          this.shipments = shipments;
          this.searchingFlag = false;

          if (podSettings) {
            const ps = podSettings as PodSettingsResponse;
            const unrequired = ps.unrequired ?? [];

            this.page = 1;
            this.storageService.set(AuthConstants.STATUS, ps.status);
            this.storageService.set(AuthConstants.DELIVER_ROUTE, ps.route.delivered);
            this.storageService.set(AuthConstants.CANCELLED_ROUTE, ps.route.cancelled);
            this.storageService.set(AuthConstants.SHIPPER_FIELDS, ps.fields.shipper);
            this.storageService.set(AuthConstants.RECEIVER_FIELDS, ps.fields.receiver);
            this.storageService.set(AuthConstants.UNREQUIRED_FIELDS, unrequired);
            this.storageService.set(AuthConstants.SIGN_FIELDS, ps.sign_fields);
          }
          resolve();
        },
        error: (err) => {
          this.handleError(err, 'Failed to load shipment data');
          reject(err);
        }
      });

      this.subscriptions.push(authSub);
    });
  }

  setShipments() {
    const sub = this.shipmentService.userShipments$.pipe(take(1)).subscribe((shipmentData: Shipment[]) => {
      if (shipmentData?.length) {
        this.shipments = shipmentData;
      }
    });
    this.subscriptions.push(sub);
  }

  viewDetails(shipmentID: number) {
    this.router.navigate(['./home/shipment/' + shipmentID]);
  }

  trackDetails(shipmentID: number) {
    this.router.navigate(['./home/view/' + shipmentID]);
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
    this.errorMessage = '';
  }

  resetSearch() {
    this.searchedList = null;
    this.search = '';
  }

  searchShipments() {
    if (!this.search.trim()) return;

    this.searchingFlag = true;

    this.shipmentService.getRoute(this.authUser.apiKey, '/shipment/search/' + this.search.trim()).subscribe({
      next: (response: Shipment[] | null) => {
        const noResults = !response || (Array.isArray(response) && response.length === 0);
        this.errorMessage = noResults ? 'No result Found' : '';
        this.searchedList = response || [];
        this.searchingFlag = false;
      },
      error: err => {
        this.handleError(err, 'Failed to search shipments');
        this.searchingFlag = false;
      }
    });
  }

  // Infinite Scroll
  loadData(event: any) {
    this.page++;

    this.shipmentService.pageByStatus(this.authUser.apiKey, this.page, this.status).subscribe({
      next: (response: Shipment[]) => {
        if (!response || response.length === 0) {
          event.target.disabled = true;
        } else {
          this.shipments.push(...response);
        }
        event.target.complete();
      },
      error: err => {
        this.handleError(err, 'Failed to load more shipments');
        event.target.complete();
      }
    });
  }

  goToShipments() {
    this.router.navigate(['./home/dashboard/']);
  }

  private handleError(err: any, fallbackMessage: string = 'Network Issue') {
    const message = `${fallbackMessage}: ${err.message || 'Unknown error'}`;
    this.toasterService.presentToast(message, 'danger', 6000);
  }
}
