import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class HttpService {
  headers = new HttpHeaders();
  options = { headers: this.headers, withCredintials: false };

  constructor(
    private http: HttpClient,
  ) { }

  post(serviceName: String, data: any) {
    const url = environment.apiUrl + serviceName;
    return this.http.post(url, data, this.options);
  }
  get(apiKey: String) {
    const url = environment.apiUrl + apiKey + '/pod/status/all/';
    return this.http.get(url, this.options);
  }
  getRoute(apiKey: String, route: any) {
    const url = environment.apiUrl + apiKey + route;
    return this.http.post(url, this.options);
  }
  getRoute1(apiKey: String, route: any) {
    const url = environment.apiUrl + apiKey + route;
    return this.http.get(url, this.options);
  }
  searchShipment(apiKey: string, data: any) {
    const url = environment.apiUrl + apiKey + '/pod/search/';
    return this.http.post(url, data, this.options);
  }
  trackShipment(apiKey: String, number: String) {
    const url = environment.apiUrl + apiKey + '/pod/track/';
    return this.http.post(url, number, this.options);
  }
  getPODSettings(apiKey: String) {
    const url = environment.apiUrl + apiKey + '/pod/settings/';
    return this.http.get(url, this.options);
  }
  getStatusList(apiKey: String) {
    const url = environment.apiUrl + apiKey + '/pod/status/';
    return this.http.get(url, this.options);
  }


  getShipmentByStatus(apiKey: string, status: string) {
    const url = environment.apiUrl + apiKey + '/pod/status/' + status;
    return this.http.get(url, this.options);
  }
  page(apiKey: String, page: number) {
    const url = environment.apiUrl + apiKey + '/pod/status/all/' + page;
    return this.http.get(url, this.options);
  }
  pageByStatus(apiKey: String, page: number, status: string) {
    const url = environment.apiUrl + apiKey + '/shipment/status/' + status + '/page/' + page;
    return this.http.get(url, this.options);
  }

  getDriverDetails(apiKey: String) {
    const url = environment.apiUrl + apiKey + '/billing-address/';
    return this.http.get(url, this.options);
  }
  getDriverRoute(apiKey: String) {
    const url = environment.apiUrl + apiKey + '/pod/route/';
    return this.http.get(url, this.options);
  }
  getDriverPickupRoute(apiKey: String) {
    const url = environment.apiUrl + apiKey + '/pod/pickup_route/';
    return this.http.get(url, this.options);
  }

  getShipmentByID(apiKey: String, ID: number) {
    const url = environment.apiUrl + apiKey + '/pod/shipment/' + ID;
    return this.http.get(url, this.options);
  }
  getShipmentsAllStatus(apiKey: String) {
    const url = environment.apiUrl + apiKey + '/shipments/status/all';
    return this.http.get(url, this.options);
  }

  getMapLocation(latlng: any, apiKey: any) {
    const url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latlng + '&sensor=true&key=' + apiKey;
    return this.http.get(url, this.options);
  }

  getSuggestedAddress(input: any, apiKey: any) {
    const url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + input + '&types=geocode&key=' + apiKey;
    return this.http.get(url, this.options);
  }

  requestChangePass(postData: any) {
    const url = environment.apiUrl + 'lost-password';
    return this.http.post(url, postData, this.options);
  }
}
