import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthConstants } from 'src/app/config/auth-constants';
import { ShipmentService } from 'src/app/services/shipment.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { Browser } from '@capacitor/browser';
import { AuthService } from 'src/app/services/auth.service';
import { Location } from '@angular/common';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit {

  public search: string = '';
  public searchedList: any;
  public authUser: any;

  //Search variables
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
  shipmentFullData: any = [];

  viewShipper: boolean = true;
  viewReceiver: boolean = true;
  viewPackage: boolean = false;
  viewHistory: boolean = false;
  viewImages: boolean = false;
  viewSignature: boolean = false;
  viewShipperIcon: string = 'caret-up-circle-outline';
  viewReceiverIcon: string = 'caret-up-circle-outline';
  viewPackageIcon: string = 'caret-down-circle-outline';
  viewHistoryIcon: string = 'caret-down-circle-outline';
  viewImagesIcon: string = 'caret-down-circle-outline';
  viewSignatureIcon: string = 'caret-down-circle-outline';

  statusList: any = [];
  shipperFields: any = [];
  receiverFields: any = [];
  public shipmentData: any = [];
  public shipmentAllData: any = [];
  public dynamicBooleans: Record<string, any> = {};

  public hasSignature = false;
  public hasCaptured = false;
  public onLoad = false;

  options = {
    share: false, // default is false
    closeButton: false, // default is true
    copyToReference: true, // default is false
    headers: '',  // If this is not provided, an exception will be triggered
    piccasoOptions: {} // If this is not provided, an exception will be triggered
  };

  constructor(
    private storageService: StorageService,
    private activatedRoute: ActivatedRoute,
    private shipmentService: ShipmentService,
    private toasterService: ToasterService,
    public loadingController: LoadingController,
    private router: Router,
    private auth: AuthService,
    private _location: Location
  ) { }

  setBooleanField(key: string, value: any) {
    this.dynamicBooleans[key] = value;
  }

  getBooleanField(key: string) {
    return this.dynamicBooleans[key];
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Processing request...',
      duration: 6000
    });
    await loading.present();
  }

  async ngOnInit() {
    // Load static data from storage on init
    this.statusList = await this.storageService.get(AuthConstants.STATUS) || [];

    const shipperFieldsObj = await this.storageService.get(AuthConstants.SHIPPER_FIELDS) || {};
    this.shipperFields = Object.entries(shipperFieldsObj).map(([key, value]) => ({ key, value }));

    const receiverFieldsObj = await this.storageService.get(AuthConstants.RECEIVER_FIELDS) || {};
    this.receiverFields = Object.entries(receiverFieldsObj).map(([key, value]) => ({ key, value }));

    // Get shipmentId from route params
    this.activatedRoute.paramMap.subscribe(paramMap => {
      this.shipmentId = paramMap.get('shipmentID');
    });
  }

  /**
   * Get the current auth user with apiKey.
   * Returns a Promise resolved when authUser is ready.
   */
  async getapikey(): Promise<void> {
    // Try authService observable first (only take the first emitted value)
    const userFromAuth = await firstValueFrom(this.auth.userData$);
    if (userFromAuth?.apiKey) {
      this.authUser = userFromAuth;
      return;
    }
    // If no apiKey found, fallback to storage
    const storedAuth = await this.storageService.get(AuthConstants.AUTH);
    this.authUser = storedAuth;
  }

  /**
   * Method to load shipment data freshly from server every time view will enter.
   */
  async ionViewWillEnter() {
    await this.getapikey();

    if (!this.authUser?.apiKey) {
      this.toasterService.presentToast('Authentication failed. Please login again.', 'danger', 6000);
      this.loadingController.dismiss();
      return;
    }

    await this.presentLoading();

    // Clear previous shipmentAllData to avoid duplication
    this.shipmentAllData = [];
    this.shipmentData = [];
    this.hasSignature = false;
    this.hasCaptured = false;
    this.onLoad = false;

    try {
      // Fetch shipment by ID
      const res: any = await firstValueFrom(
        this.shipmentService.getShipmentByID(this.authUser.apiKey, this.shipmentId)
      );

      if (res?.status === 'error') {
        this.toasterService.presentToast(res.message, 'danger', 6000);
        this.loadingController.dismiss();
        return;
      }

      // Fetch shipment fields info (route /shipment/fields)
      const response: any = await firstValueFrom(
        this.shipmentService.getRoute1(this.authUser.apiKey, '/shipment/fields')
      );

      if (response) {
        let indexCount = 0;
        this.shipmentAllData = [];

        for (const [sectionKey, sectionFields] of Object.entries(response)) {
          if (
            sectionKey &&
            Array.isArray(sectionFields) &&
            sectionFields.length > 0 &&
            sectionFields[0].field_key &&
            !AuthConstants.CUSTOM_SECTIONS_TO_HIDE.includes(sectionKey)
          ) {
            this.shipmentService.sortObjectsArrayByProperty(sectionFields, 'weight');

            const sectionData = sectionFields.map((field: any) => ({
              key: field.field_key,
              value: res[field.field_key] || '',
              label: field.label || '',
            }));

            this.shipmentAllData.push({
              sectionLabel: this.shipmentService.toTitleCase(sectionKey),
              sectionKey,
              sectionView: false,
              sectionIndex: indexCount++,
              sectionData,
            });

            this.setBooleanField(sectionKey, false);
          }
        }
      }

      this.onLoad = true;

      const signature = res.pod_signature;
      const capturedImages = res.pod_images || [];

      this.hasSignature = !!(signature && signature !== '' && signature !== false);
      this.hasCaptured = capturedImages.length > 0;

      let resData: any = {};
      const shipperMeta: any = this.shipperFields;
      const receiverMeta: any = this.receiverFields;

      resData.ID = res.ID;
      resData.shipment_number = res.shipment_number;
      resData.wpcargo_status = res.wpcargo_status;
      resData.pod_images = capturedImages;
      resData.pod_signature = signature;
      resData.shipment_packages = res.shipment_packages;
      resData.history = res.shipment_history ? [...res.shipment_history].reverse() : [];
      resData.details = this.setShipmentDetails(res);

      if (resData.history && resData.history.length > 0) {
        const item = resData.history[0];
        this.currentDate = item['date'];
      }

      for (let shipper of shipperMeta) {
        resData[shipper.key] = res[shipper.key];
      }

      for (let receiver of receiverMeta) {
        resData[receiver.key] = res[receiver.key];
      }

      this.shipmentData = Object.assign({}, resData);
    }
    catch (err: any) {
      let message = 'Network Issue. ';
      if (err?.error?.message) message += err.error.message;
      else if (err?.message) message += err.message;
      else message += 'Please try again later.';
      this.toasterService.presentToast(message, 'danger', 6000);
    }
    finally {
      this.loadingController.dismiss();
    }
  }

  setShipmentDetails(res: any) {
    let details: any = {};

    if (res.wpcargo_comments) {
      details.wpcargo_comments = res.wpcargo_comments;
    }

    if (res.wpcargo_origin_field) {
      details.origin = res.wpcargo_origin_field;
    }

    if (res.wpcargo_destination) {
      details.destination = res.wpcargo_destination;
    }

    if (res.wpcargo_pickup_date_picker) {
      details.departure = res.wpcargo_pickup_date_picker;
    }

    if (res.wpcargo_expected_delivery_date_picker) {
      details.arrival = res.wpcargo_expected_delivery_date_picker;
    }

    return details;
  }

  goToShipments() {
    // this.router.navigate(['/home/dashboard']);
    this._location.back();
  }

  returnList() {
    this.router.navigate(['/home/delivered']);
  }

  hideHistory() {
    this.viewHistory = !this.viewHistory;
    this.viewHistoryIcon = this.viewHistoryIcon === 'caret-down-circle-outline' ? 'caret-up-circle-outline' : 'caret-down-circle-outline';
  }

  hideShipper() {
    this.viewShipper = !this.viewShipper;
    this.viewShipperIcon = this.viewShipperIcon === 'caret-up-circle-outline' ? 'caret-down-circle-outline' : 'caret-up-circle-outline';
  }

  hideReceiver() {
    this.viewReceiver = !this.viewReceiver;
    this.viewReceiverIcon = this.viewReceiverIcon === 'caret-up-circle-outline' ? 'caret-down-circle-outline' : 'caret-up-circle-outline';
  }

  hidePackage() {
    this.viewPackage = !this.viewPackage;
    this.viewPackageIcon = this.viewPackageIcon === 'caret-down-circle-outline' ? 'caret-up-circle-outline' : 'caret-down-circle-outline';
  }

  hideImages() {
    this.viewImages = !this.viewImages;
    this.viewImagesIcon = this.viewImagesIcon === 'caret-down-circle-outline' ? 'caret-up-circle-outline' : 'caret-down-circle-outline';
  }

  hideSignature() {
    this.viewSignature = !this.viewSignature;
    this.viewSignatureIcon = this.viewSignatureIcon === 'caret-down-circle-outline' ? 'caret-up-circle-outline' : 'caret-down-circle-outline';
  }

  zoomPhoto = async (url: any) => {
    await Browser.open({ url: url });
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

  async searchShipments() {
    await this.presentLoading();
    this.searchingFlag = true;

    let postData: any = {};
    postData.search = this.search.trim();

    try {
      const response: any = await firstValueFrom(
        this.shipmentService.searchShipment(this.authUser.apiKey, postData)
      );

      this.errorMessage = !response || response.length === 0 ? 'No result Found' : '';
      this.searchedList = response;
      this.searchingFlag = false;
      this.setDate();
    } catch (err: any) {
      let message = 'Network Issue. ';
      if (err?.error?.message) message += err.error.message;
      else if (err?.message) message += err.message;
      else message += 'Please try again later.';
      this.errorMessage = message;
    } finally {
      this.loadingController.dismiss();
    }
  }

  trackDetails(shipmentID: number) {
    this.router.navigate(['./home/view/' + shipmentID]);
  }

  setDate() {
    if (!this.searchedList) return;
    this.searchedList.forEach((element: any, key: any) => {
      if (element.shipment_history && element.shipment_history.length > 0) {
        let latest = element.shipment_history[0];
        this.searchedList[key]['current_date'] = latest['date'];
      }
    });
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      this.ionViewWillEnter();
      event.target.complete();
    }, 2000);
  }

  handleClick(event: Event) {
    const target = event.currentTarget as HTMLElement;
    let sectionIndex: any = target.getAttribute('data-sectionIndex');
    if (sectionIndex !== null && this.shipmentAllData[sectionIndex]) {
      this.shipmentAllData[sectionIndex].sectionView = !this.shipmentAllData[sectionIndex].sectionView;
    }
  }

}
