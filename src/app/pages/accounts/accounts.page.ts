import { AuthService } from 'src/app/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthConstants } from 'src/app/config/auth-constants';
import { ShipmentService } from 'src/app/services/shipment.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss'],
})
export class AccountsPage implements OnInit {
  userData: any = [];
  public search: string = '';
  public searchedList: any;
  public authUser: any;
  stateFlag = false;
  loadFlag = false;
  searchingFlag = false;
  noResultFlag = false;
  isSettingsSetup = false;
  errorMessage: any = false;
  isLoading = false;
  apiKey: string = '';
  driverName: string = '';
  shipmentId: any;
  currentDate: any;
  errMessage: string = '';
  canUpdate: boolean = true;
  driverFullData: any = [];
  loading: HTMLIonLoadingElement;

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private shipmentService: ShipmentService,
    private toasterService: ToasterService,
    public loadingController: LoadingController,
    private router: Router
  ) {}

  ngOnInit() {
    // ngOnInit is for initial setup, data fetching logic should be in ionViewWillEnter
  }

  async ionViewWillEnter() {
    // 1. Show a loading spinner immediately
    this.loading = await this.presentLoading();

    // 2. Get user data from storage
    const storedUser = await this.storageService.get(AuthConstants.AUTH);

    // 3. Check if user data exists and has an API key
    if (storedUser && storedUser.apiKey) {
      this.authUser = storedUser;
      this.userData = storedUser;
      if(!this.userData.first_name && !this.userData.last_name) {
        this.userData['fullname'] = this.userData.username;
      } else {
        this.userData['fullname'] = this.userData.first_name + ' ' + this.userData.last_name;
      }
      this.apiKey = storedUser.apiKey;

      // 4. Call the API to get driver details using the fetched API key
      this.shipmentService.getDriverDetails(this.authUser.apiKey).subscribe({
        next: (result: any) => {
          if(this.userData.username) {
            result['username'] = this.userData.username;
          }
          this.driverFullData = this.remapDriverData(result);
          this.loading.dismiss(); // Dismiss on success
        },
        error: (err: any) => {
          this.handleError(err, 'Failed to fetch user data');
          this.loading.dismiss(); // Dismiss on error
        }
      });
    } else {
      // 5. If no valid user data, dismiss loading and show error
      this.loading.dismiss();
      this.toasterService.presentToast('Authentication failed. Please log in again.', 'danger');
      this.router.navigate(['/login']);
    }
  }

  remapDriverData(result: any) {
    let driver: any = {}; // Use an object, not an array
    driver.fullname = result.first_name + ' ' + result.last_name;
    if(!result.first_name && !result.last_name) {
      driver.fullname = result.username;
    }
    if (result.billing_address_1) {
      driver.address = result.billing_address_1;
    }
    driver.email = result.billing_email;
    if (result.phone) {
      driver.phone = result.phone;
    } else {
      driver.phone = result.billing_phone;
    }
    return driver;
  }

  logout() {
    this.authService.logout();
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

    let postData: any = {};
    postData.search = this.search.trim();

    this.shipmentService.searchShipment(this.authUser.apiKey, postData).subscribe({
      next: (response: any) => {
        this.errorMessage = !response ? 'No result Found' : '';
        this.searchedList = response;
        this.searchingFlag = false;
      },
      error: (err: any) => {
        this.handleError(err, 'Failed to search shipments');
        this.searchingFlag = false;
      }
    });
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      spinner: 'circles',
      message: 'Loading details...',
      duration: 1000
    });
    await loading.present();
    return loading;
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      this.ionViewWillEnter().finally(() => {
        event.target.complete();
      });
    }, 2000);
  }

  private handleError(err: any, fallbackMessage: string = 'Network Issue') {
    const message = `${fallbackMessage}: ${err.message || 'Unknown error'}`;
    this.toasterService.presentToast(message, 'danger', 6000);
  }
}