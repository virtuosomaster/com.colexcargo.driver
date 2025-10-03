import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  Input,
  SimpleChanges,
  OnChanges,
  Output,
  EventEmitter
} from '@angular/core';
import { GmapService } from 'src/app/services/gmap.service';
import { AuthService } from 'src/app/services/auth.service';
import { ShipmentService } from 'src/app/services/shipment.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { AuthConstants } from 'src/app/config/auth-constants';
import { StorageService } from 'src/app/services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pickupmap',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true
})
export class PickupMapComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('map', { static: true }) mapElementRef!: ElementRef;
  @Input() refreshPickupRoute!: number;
  @Output() hasRoutes = new EventEmitter<boolean>();

  private subscriptions = new Subscription();
  private googleMaps: any;
  private map: any;

  source = { lat: 41.99832317708536, lng: -87.88442650407525 };

  directionsService: any;
  directionsDisplay: any;

  public authUser: any;
  public shipments: any[] = [];
  public summary: string = '';
  public poo: boolean = false;
  public driverRoutes: any[] = [];
  public hasPickupRoutes: boolean = false;

  constructor(
    private maps: GmapService,
    private renderer: Renderer2,
    private auth: AuthService,
    private shipmentService: ShipmentService,
    private toasterService: ToasterService,
    private storageService: StorageService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshPickupRoute']) {
      this.subscriptions.add(
        this.auth.userData$.subscribe(async (res: any) => {
          this.authUser = res?.apiKey ? res : await this.storageService.get(AuthConstants.AUTH);
          if (this.authUser?.apiKey) {
            this.loadPickupRoute(); // Same logic as delivery component
          }
        })
      );
    }
  }

  ngOnInit() {
    this.subscriptions.add(
      this.auth.userData$.subscribe(async (res: any) => {
        this.authUser = res?.apiKey ? res : await this.storageService.get(AuthConstants.AUTH);
        if (this.authUser?.apiKey) {
          this.loadPickupRoute(); // Fetch route on init
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async ngAfterViewInit() {
    this.googleMaps = await this.maps.loadGoogleMaps();
    this.initializeMap(); // Only init, not render route yet
  }

  async initializeMap() {
    const mapEl = this.mapElementRef.nativeElement;

    this.map = new this.googleMaps.Map(mapEl, {
      center: this.source,
      disableDefaultUI: true,
      zoom: 12,
    });

    this.directionsService = new this.googleMaps.DirectionsService();
    this.directionsDisplay = new this.googleMaps.DirectionsRenderer({
      map: this.map,
      polylineOptions: {
        strokeWeight: 3,
        strokeOpacity: 1,
        strokeColor: '#028fa5',
      },
      suppressMarkers: true,
    });

    this.renderer.addClass(mapEl, 'visible');
  }

  loadPickupRoute() {
    this.subscriptions.add(
      this.shipmentService.getDriverPickupRoute(this.authUser.apiKey).subscribe({
        next: (response: any) => {
          const hasData = !!(response?.origin && response?.destination);

          this.hasPickupRoutes = hasData;
          this.hasRoutes.emit(hasData);

          if (!hasData) {
            this.clearRoute();
            return;
          }

          this.shipments = response.shipments || [];
          this.poo = !!response.poo;

          const origin = response.origin?.address;
          const destination = response.destination?.address;
          const waypoints = response.waypoints?.map((wp: any) => ({
            location: wp.address,
            stopover: true,
          })) ?? [];

          if (origin && destination) {
            this.calculateAndDisplayRoute(origin, destination, waypoints, this.shipments, this.poo, this.map);
          }
        },
        error: (err) => {
          let message = 'Network Issue. ';
          message += err.error?.message ?? err.message;
          this.hasPickupRoutes = false;
          this.hasRoutes.emit(false);
          this.clearRoute();
          this.toasterService.presentToast(message, 'danger', 6000);
        },
      })
    );
  }

  async renderMarker(
    data: any,
    content: string,
    map: any,
    end = true,
    warehouse = false
  ) {
    const googleMaps = this.googleMaps;
    const position = end ? data.end_location : data.start_location;
    const image = warehouse ? 'origin-marker.png' : 'pickup.png';

    const icon = {
      url: `../../../assets/images/${image}`,
      scaledSize: new googleMaps.Size(30, 40),
      origin: new googleMaps.Point(0, 0),
      anchor: new googleMaps.Point(22, 18),
    };

    const marker = new googleMaps.Marker({
      position,
      map,
      icon,
      animation: googleMaps.Animation.DROP,
      title: end ? data.end_address : data.start_address,
    });

    const infowindow = new googleMaps.InfoWindow({ content });
    marker.addListener('click', () => infowindow.open(map, marker));
  }

  calculateAndDisplayRoute(
    origin: string,
    destination: string,
    waypoints: any[],
    shipments: any[],
    poo: boolean,
    map: any
  ) {
    const googleMaps = this.googleMaps;

    this.directionsService.route(
      {
        origin,
        destination,
        waypoints,
        optimizeWaypoints: true,
        travelMode: googleMaps.TravelMode.DRIVING,
      },
      (response: any, status: any) => {
        if (status === 'OK') {
          this.directionsDisplay.setDirections(response);

          const route = response.routes[0];
          const legs = route.legs;
          this.driverRoutes = [];

          if (legs) {
            this.source = {
              lat: legs[0].start_location.lat(),
              lng: legs[0].start_location.lng(),
            };
          }

          for (let i = 0; i < legs.length; i++) {
            const leg = legs[i];
            const shipment = shipments[i];

            const content = `
              <b>Route Segment ${i + 1}</b><br>
              <b>Distance:</b> ${leg.distance.text}<br>
              ${leg.start_address} to ${leg.end_address}<br>
              <b>Shipment Number:</b> ${shipment?.number}<br>
              ${shipment?.info ? Object.values(shipment.info).join('<br>') : ''}
            `;

            this.renderMarker(leg, content, map);

            leg['number'] = shipment?.number;
            leg['id'] = shipment?.id;
            leg['info'] = shipment?.info;
            this.driverRoutes.push(leg);

            if (i === 0) {
              this.summary = `<section class="border-bottom mb-4 pb-4">${content}</section>`;
            }
          }

          if (poo && legs[0]) {
            const leg = legs[0];
            const sContent = `
              <b>Point of Origin:</b><br>
              <b>Distance:</b> ${leg.distance.text}<br>
              ${leg.start_address} to ${leg.end_address}
            `;
            this.renderMarker(leg, sContent, map, false, true);
          }

          this.shipmentService.routeSet(AuthConstants.DRIVER_PWAYPOINTS, this.driverRoutes);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      }
    );
  }

  clearRoute() {
    if (this.directionsDisplay) {
      this.directionsDisplay.set('directions', null);
    }

    this.driverRoutes = [];
    this.summary = '';
    this.shipments = [];
  }
}
