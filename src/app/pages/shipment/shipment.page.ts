import { Component, NgZone, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { ShipmentService } from 'src/app/services/shipment.service';
import { AuthConstants } from '../../config/auth-constants';
import { ModalController, LoadingController } from '@ionic/angular';
import { SignatureComponent } from 'src/app/components/signature/signature.component';
import { formatDate } from '@angular/common';
import { Camera, CameraResultType } from '@capacitor/camera';
import { ToasterService } from 'src/app/services/toaster.service';
import { AuthService } from 'src/app/services/auth.service';
import { Geolocation } from '@capacitor/geolocation';
import { environment } from 'src/environments/environment';
import { HttpService } from 'src/app/services/http.service';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

declare var google: any;

@Component({
  selector: 'app-shipment',
  templateUrl: './shipment.page.html',
  styleUrls: ['./shipment.page.scss'],
})
export class ShipmentPage implements OnInit, OnDestroy {
  public search: string = '';
  public searchedList: any;
  public authUser: any;

  stateFlag = false;
  loadFlag = false;
  searchingFlag = false;
  noResultFlag = false;
  isSettingsSetup = false;
  errorMessage: any = false;

  imageSrc: any = '';
  capturedSnapURL: any[] = [];
  statusList: any[] = [];
  signFields: any = [];
  signFields1: any = [];
  canUpdate: boolean = true;
  onProcess: boolean = false;

  viewShipper: boolean = false;
  viewReceiver: boolean = false;
  viewPackage: boolean = false;

  viewShipperIcon: string = 'arrow-down';
  viewReceiverIcon: string = 'arrow-down';
  viewPackageIcon: string = 'arrow-down';

  apiKey: string = '';
  driverName: string = '';
  shipmentId: any;
  errMessage: string = '';

  shipperFields: any = [];
  receiverFields: any = [];
  unRequiredFields: any = [];
  shipmentFullData: any = [];

  public postData: any = {
    signature: null,
    shipment: '',
    shipment_history: [],
    pod_images: [],
    location: '',
    wpcargo_status: ''
  };

  autocomplete = { input: '' };
  autocompleteItems: any[] = [];
  GoogleAutocomplete: any;
  sign_required: any = '';

  public fillAddress: any = '';
  public addressValue: any = '';
  public shipmentData: any = [];

  isLoading = false;

  private authSubscription?: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private shipmentService: ShipmentService,
    private router: Router,
    public modalController: ModalController,
    private toasterService: ToasterService,
    public loadingController: LoadingController,
    public zone: NgZone,
    private auth: AuthService,
    private httpService: HttpService,
    private _location: Location
  ) {
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
  }

  async ngOnInit() {
    await this.loadLocalData();
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (paramMap.has('shipmentID')) {
        this.shipmentId = paramMap.get('shipmentID');
      }
    });
  }

  ionViewWillEnter() {
    // Reset old data first to avoid stale display
    this.resetForm();
    this.shipmentData = null;
    this.errMessage = '';
    this.canUpdate = true;

    this.getapikeyAndFetchData();
    this.getapikey(); // keep subscription for authUser changes

    this.autocomplete.input = '';

    this.storageService.get(AuthConstants.UNREQUIRED_FIELDS).then(res => {
      this.unRequiredFields = res;
    });
  }

  async getapikeyAndFetchData() {
    if (this.authUser && this.authUser.apiKey) {
      await this.fetchShipmentData();
    } else {
      this.authSubscription = this.auth.userData$.subscribe(async (res: any) => {
        if (res?.apiKey) {
          this.authUser = res;
          await this.fetchShipmentData();
        } else {
          const storedAuth = await this.storageService.get(AuthConstants.AUTH);
          if (storedAuth?.apiKey) {
            this.authUser = storedAuth;
            await this.fetchShipmentData();
          } else {
            this.toasterService.presentToast('User not authenticated', 'danger');
          }
        }
      });
    }
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
  }

  async loadLocalData() {
    const [
      statusList,
      signFields,
      authData,
      shipperFields,
      receiverFields
    ] = await Promise.all([
      this.storageService.get(AuthConstants.STATUS),
      this.storageService.get(AuthConstants.SIGN_FIELDS),
      this.storageService.get(AuthConstants.AUTH),
      this.storageService.get(AuthConstants.SHIPPER_FIELDS),
      this.storageService.get(AuthConstants.RECEIVER_FIELDS),
    ]);

    this.statusList = statusList;
    this.signFields = this.signFields1 = signFields;
    this.apiKey = authData.apiKey;
    this.driverName = `${authData.first_name} ${authData.last_name}`;

    Object.keys(signFields).forEach(key => {
      this.postData[key.toString()] = '';
    });

    this.shipperFields = Object.entries(shipperFields).map(([key, value]) => ({ key, value }));
    this.receiverFields = Object.entries(receiverFields).map(([key, value]) => ({ key, value }));
  }

  async presentLoading() {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      spinner: 'circles',
      message: 'Processing Shipment Data...',
      duration: 3000
    });
    await loading.present();
  }

  async fetchShipmentData() {
    if (!this.authUser || !this.authUser.apiKey) {
      this.toasterService.presentToast('Authentication data missing.', 'danger');
      return;
    }

    this.presentLoading();

    this.shipmentService.getShipmentByID(this.authUser.apiKey, this.shipmentId).subscribe({
      next: async (res: any) => {
        this.loadingController.dismiss();

        if (res.status === 'error') {
          this.canUpdate = false;
          this.errMessage = res.message;
        } else {
          const { ID, shipment_number } = res;
          let resData: any = { ID, shipment_number };

          for (const shipper of this.shipperFields) {
            resData[shipper.key] = res[shipper.key];
          }

          for (const receiver of this.receiverFields) {
            resData[receiver.key] = res[receiver.key];
          }

          this.shipmentData = { ...resData };
          this.shipmentFullData = res;

          await this.getCurrentLoc();
        }
      },
      error: err => {
        this.loadingController.dismiss();
        this.toasterService.presentToast("Network Issue. " + err.error.message, 'danger', 2000);
      }
    });
  }

  async getCurrentLoc() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      const latlng = `${coordinates.coords.latitude},${coordinates.coords.longitude}`;

      this.httpService.getMapLocation(latlng, environment.apiKey).subscribe({
        next: (resp: any) => {
          if (resp.status === 'OK' && resp.results.length > 0) {
            this.fillAddress = resp.results[0];
            this.addressValue = this.fillAddress.formatted_address;
            this.postData.location = this.addressValue;
          }
          this.loadingController.dismiss();
        }
      });
    } catch (error) {
      this.toasterService.presentToast('Location access failed.', 'danger');
      this.loadingController.dismiss();
    }
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: SignatureComponent,
      cssClass: 'signatureModal'
    });
    modal.onWillDismiss().then(dataReturned => {
      this.postData.signature = dataReturned.data;
    });
    return await modal.present();
  }

  removeSignature() {
    this.postData.signature = null;
  }

  trackDetails(shipmentID: number) {
    this.router.navigate(['./home/view/' + shipmentID]);
  }

  goToShipments() {
    this.resetForm();
    this._location.back();
  }

  resetForm() {
    this.postData = {
      signature: null,
      shipment: '',
      shipment_history: [],
      pod_images: [],
      location: '',
      wpcargo_status: ''
    };
    this.capturedSnapURL = [];
  }

  validateInputs(): boolean {
    if (!this.unRequiredFields.includes('signature') && !this.postData.signature) {
      this.toasterService.presentToast('Signature is required.', 'danger');
      return false;
    }

    if (!this.unRequiredFields.includes('photo') && this.capturedSnapURL.length === 0) {
      this.toasterService.presentToast('Images are required.', 'danger');
      return false;
    }

    for (let key in this.signFields) {
      const fieldValue = this.postData[key];
      if (!fieldValue || fieldValue.trim().length === 0 && this.signFields[key]['required']) {
        this.toasterService.presentToast(`${this.signFields[key]['label']} is required.`, 'danger');
        return false;
      }
    }

    return true;
  }

  getapikey() {
    this.authSubscription = this.auth.userData$.subscribe((res: any) => {
      if (res.apiKey) {
        this.authUser = res;
      } else {
        this.storageService.get(AuthConstants.AUTH).then(res => {
          this.authUser = res;
        });
      }
    });
  }

  submitAction() {
    if (!this.validateInputs()) return;

    this.presentLoading();
    this.onProcess = true;

    let shipmentNumber = this.shipmentData.shipment_number;
    let postData = { ...this.postData };

    postData.shipment = shipmentNumber;
    postData.pod_images = this.capturedSnapURL;
    postData.shipment_history = [{
      date: formatDate(new Date(), 'yyyy-MM-dd', 'en'),
      time: formatDate(new Date(), 'H:m:s', 'en'),
      'updated-name': this.driverName
    }];

    for (let key in this.signFields) {
      const fieldValue = this.postData[key]?.trim() || '';
      postData.shipment_history[0][key] = fieldValue;
      if (key === 'status') {
        postData.wpcargo_status = fieldValue;
      }
    }

    this.shipmentService.updateShipment(this.authUser.apiKey, postData).subscribe({
      next: (res: any) => {
        this.onProcess = false;
        this.toasterService.presentToast(res.message, 'success');
        if(postData.status) {
          this.router.navigate(['./home/shipments/' + postData.status]);
        }
      },
      error: (err: any) => {
        this.onProcess = false;
        const message = "Error. " + err.error.message;
        this.toasterService.presentToast(message, 'danger', 2000);
      }
    });
  }

  async takeSnap() {
    const image = await Camera.getPhoto({
      quality: 70,
      allowEditing: true,
      resultType: CameraResultType.Base64
    });

    const base64Image = 'data:image/png;base64,' + image.base64String;
    this.imageSrc = image.base64String;
    this.capturedSnapURL.push(base64Image);
  }

  removeImage(index: number) {
    this.capturedSnapURL.splice(index, 1);
  }

  toggleSection(section: 'shipper' | 'receiver' | 'package') {
    switch (section) {
      case 'shipper':
        this.viewShipper = !this.viewShipper;
        this.viewShipperIcon = this.viewShipper ? 'arrow-up' : 'arrow-down';
        break;
      case 'receiver':
        this.viewReceiver = !this.viewReceiver;
        this.viewReceiverIcon = this.viewReceiver ? 'arrow-up' : 'arrow-down';
        break;
      case 'package':
        this.viewPackage = !this.viewPackage;
        this.viewPackageIcon = this.viewPackage ? 'arrow-up' : 'arrow-down';
        break;
    }
  }

  SelectSearchResult(item: any) {
    this.autocomplete.input = item.description;
    this.postData.location = item.description;
    this.autocompleteItems = [];
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
    this.search = '';
    this.onClear();
  }

  searchShipments() {
    this.presentLoading();
    this.searchingFlag = true;

    const postData = { search: this.search.trim() };

    this.shipmentService.searchShipment(this.authUser.apiKey, postData).subscribe({
      next: (response: any) => {
        this.searchedList = response;
        this.searchingFlag = false;
        this.setDate();
        this.loadingController.dismiss();
        this.errorMessage = response ? '' : 'No result found';
      },
      error: (err: any) => {
        this.errorMessage = "Network Issue. " + err.error.message;
      }
    });
  }

  setDate() {
    if (!this.searchedList) return;
    this.searchedList.forEach((element: any, key: any) => {
      if (element.shipment_history?.length) {
        this.searchedList[key]['current_date'] = element.shipment_history[0]['date'];
      }
    });
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      this.ionViewWillEnter();
      event.target.complete();
    }, 2000);
  }

  async locationAutocomplete(e: any) {
    this.presentLoading();
    const coordinates = await Geolocation.getCurrentPosition();
    const latlng = `${coordinates.coords.latitude},${coordinates.coords.longitude}`;

    if (e.detail.checked) {
      this.addressValue = '';
      this.postData.location = this.addressValue;
    } else {
      this.httpService.getMapLocation(latlng, environment.apiKey).subscribe({
        next: (resp: any) => {
          if (resp.status === 'OK' && resp.results.length) {
            this.fillAddress = resp.results[0];
            this.addressValue = this.fillAddress.formatted_address;
            this.postData.location = this.addressValue;
          }
          this.loadingController.dismiss();
        }
      });
    }
  }

  UpdateSearchResults() {
    if (!this.autocomplete.input) {
      this.autocompleteItems = [];
      return;
    }

    this.GoogleAutocomplete.getPlacePredictions({ input: this.autocomplete.input },
      (predictions: any[], status: any) => {
        this.autocompleteItems = [];
        this.zone.run(() => {
          predictions?.forEach(prediction => {
            this.autocompleteItems.push(prediction);
          });
        });
      });
  }
}
