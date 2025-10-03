import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { StorageService } from './storage.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

import { AuthConstants } from '../config/auth-constants';

@Injectable({
  providedIn: 'root'
})
export class ShipmentService {

  userShipments$ = new BehaviorSubject<any>([]);

  public shipmentList: any;

  private store: Map<string, BehaviorSubject<any>> = new Map();

  constructor(
    private storageService: StorageService,
    private httpService: HttpService,
    private auth: AuthService
  ) { }

  sortObjectsArrayByProperty(arr: any[], prop: string): void {
    arr.sort((a: any, b: any) => {
      return Number(a[prop]) - Number(b[prop]);
    });
  }

  toTitleCase(input: string): string {
    return input
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  routeSet(key: string, value: any): void {
    if (this.store.has(key)) {
      this.store.get(key)!.next(value);
    } else {
      this.store.set(key, new BehaviorSubject(value));
    }
  }

  /**
   * Get data by key
   * @param key The unique identifier
   * @returns The stored value or undefined
   */
  routeGet(key: string): any {
    return this.store.has(key) ? this.store.get(key)!.value : undefined;
  }

  routeGetObservable(key: string): Observable<any> {
    if (!this.store.has(key)) {
      this.store.set(key, new BehaviorSubject<any>(null));
    }
    return this.store.get(key)!.asObservable();
  }

  /**
   * Clear data by key
   * @param key The unique identifier to clear
   */
  routeClear(key: string): void {
    if (this.store.has(key)) {
      this.store.get(key)!.complete(); // finalize observable
      this.store.delete(key);
    }
  }

  get(apiKey: string): Observable<any> {
    return this.httpService.get(apiKey);
  }
  getRoute(apiKey: String, route: any): Observable<any> {
    return this.httpService.getRoute(apiKey, route);
  }
  getRoute1(apiKey: String, route: any): Observable<any> {
    return this.httpService.getRoute1(apiKey, route);
  }

  getPODSettings(apiKey: string): Observable<any> {
    return this.httpService.getPODSettings(apiKey);
  }
  searchShipment(apiKey: string, postData: any): Observable<any> {
    return this.httpService.searchShipment(apiKey, postData);
  }
  getStatusList(apiKey: string): Observable<any> {
    return this.httpService.getStatusList(apiKey);
  }

  page(apiKey: string, page: number): Observable<any> {
    return this.httpService.page(apiKey, page);
  }

  getShipmentByID(apiKey: string, ID: number): Observable<any> {
    return this.httpService.getShipmentByID(apiKey, ID);
  }

  getDriverDetails(apiKey: String) {
    return this.httpService.getDriverDetails(apiKey);
  }

  getDriverRoute(apiKey: String) {
    return this.httpService.getDriverRoute(apiKey);
  }
  getDriverPickupRoute(apiKey: String) {
    return this.httpService.getDriverPickupRoute(apiKey);
  }
  trackShipment(apiKey: string, number: string): Observable<any> {
    return this.httpService.trackShipment(apiKey, number);
  }

  getShipmentByStatus(apiKey: string, status: string): Observable<any> {
    return this.httpService.getShipmentByStatus(apiKey, status);
  }

  pageByStatus(apiKey: string, page: number, status: string): Observable<any> {
    return this.httpService.pageByStatus(apiKey, page, status);
  }

  updateShipment(key: String, postData: any): Observable<any> {
    return this.httpService.post(key + '/shipment/update', postData);
  }
  getShipmentsAllStatus(apiKey: string): Observable<any> {
    return this.httpService.getShipmentsAllStatus(apiKey);
  }

  requestChangePass(postData: any): Observable<any> {
    return this.httpService.requestChangePass(postData);
  }

}
