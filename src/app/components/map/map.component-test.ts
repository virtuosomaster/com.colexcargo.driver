import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { GmapService } from 'src/app/services/gmap.service';
import { AuthService } from 'src/app/services/auth.service';
import { ShipmentService } from 'src/app/services/shipment.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { AuthConstants } from 'src/app/config/auth-constants';
import { StorageService } from 'src/app/services/storage.service';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true
})
export class MapComponent implements OnInit, OnDestroy {

  @ViewChild('map', { static: true }) mapElementRef!: ElementRef;
  source: any = { lat: 10.7568543, lng: 122.5253729 };
  dest: any = { lat: 10.684502, lng: 122.5169892 };
  map: any;
  source_marker: any;
  // mapCenterChangedListener: any;
  markerDragStartListener: any;
  markerDragEndListener: any;
  // mapDragging = false;
  mapDragEndListener: any;
  mapDragStartListener: any;
  public authUser: any;
  public shipments: any = [];
  wayPoints: any = [];
  public summary: any;

  constructor(
    private maps: GmapService,
    private renderer: Renderer2,
    private auth: AuthService,
    private shipmentService: ShipmentService,
    private toasterService: ToasterService,
    private storageService: StorageService,
  ) { }

  ngOnInit() {

    this.auth.userData$.subscribe((res: any) => {
      if (res.apiKey) {
        this.authUser = res;

        // console.log(res);
      }
    });



  }

  ionViewWillEnter() {

  }


  ngAfterViewInit() {
    this.loadMap();
  }


  async loadMap() {
    try {

      let googleMaps: any = await this.maps.loadGoogleMaps();
      const mapEl = this.mapElementRef.nativeElement;
      const directionsService = new googleMaps.DirectionsService();
      const directionsRenderer = new googleMaps.DirectionsRenderer();
      this.map = new googleMaps.Map(mapEl, {
        center: { lat: this.source.lat, lng: this.source.lng },
        disableDefaultUI: true,
        zoom: 13,
      });

      directionsRenderer.setMap(this.map);

      this.storageService.get(AuthConstants.DRIVER_DELIVER_ROUTE).then(res => {
        this.shipments = res;
        // console.log(this.shipments);
        //  console.log(this.shipments.origin['address']);


        this.shipments.waypoints.forEach((value: any) => {
          this.wayPoints.push({
            location: value.address,
            stopover: true,
          });
        });

        console.log(this.wayPoints);

        this.calculateAndDisplayRoute(directionsService, directionsRenderer, this.shipments.origin['address'], this.shipments.destination['address'], this.wayPoints, this.shipments.shipments, this.shipments.poo);

      });




      /* // const sourceIconUrl = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=O|FFFF00|000000';
       const sourceIconUrl = '../../../assets/pin.png';
       
       const source_position = new googleMaps.LatLng(this.source.lat, this.source.lng);
 
       const source_icon = {
         url: sourceIconUrl,
         scaledSize: new googleMaps.Size(50, 50), // scaled size
         // origin: new googleMaps.Point(0, 0), // origin
         // anchor: new googleMaps.Point(0, 0) // anchor
       };
 
       this.source_marker = new googleMaps.Marker({
         map: this.map,
         position: source_position,
         draggable: true,
         animation: googleMaps.Animation.DROP,
         icon: source_icon,
       });
 
       this.source_marker.setMap(this.map);
 
       this.map.setCenter(source_position);
 
       this.renderer.addClass(mapEl, 'visible');
 */
      //this.eventListeners(googleMaps);

    } catch (e) {
      console.log(e);
    }
  }

  eventListeners(googleMaps: any) {
    // Add event listeners for map and marker
    this.mapDragStartListener = googleMaps.event.addListener(this.map, 'dragstart', () => {
      // this.mapDragging = true;
    });

    this.mapDragEndListener = googleMaps.event.addListener(this.map, 'dragend', () => {
      // this.mapDragging = false;
      // console.log('dragend: ', this.mapDragging);
      this.moveMarkerToCenter();
    });

    // this.mapCenterChangedListener = googleMaps.event.addListener(this.map, 'center_changed', () => {
    //   console.log('center_changed: ', this.mapDragging);
    // });

    this.markerDragStartListener = googleMaps.event.addListener(this.source_marker, 'dragstart', () => {
      this.map.setOptions({ draggable: false });
    });

    this.markerDragEndListener = googleMaps.event.addListener(this.source_marker, 'dragend', () => {
      console.log('marker drag end: ', this.source_marker);
      this.map.setOptions({ draggable: true });
      this.moveMapToMarkerAtCenter();
    });
  }

  moveMarkerToCenter() {
    const center = this.map.getCenter();
    const markerPosition = { lat: center.lat(), lng: center.lng() };
    console.log(markerPosition);
    this.source_marker.setPosition(markerPosition);
  }

  moveMapToMarkerAtCenter() {
    const markerPosition = this.source_marker.getPosition();
    this.map.setCenter(markerPosition);
  }

  ngOnDestroy(): void {
    if (this.mapDragStartListener) {
      this.mapDragStartListener.remove();
    }

    if (this.mapDragEndListener) {
      this.mapDragEndListener.remove();
    }

    // if (this.mapCenterChangedListener) {
    //   this.mapCenterChangedListener.remove();
    // }

    if (this.markerDragStartListener) {
      this.markerDragStartListener.remove();
    }

    if (this.markerDragEndListener) {
      this.markerDragEndListener.remove();
    }
    // googleMaps.event.clearInstanceListeners(this.map);
    // googleMaps.event.clearInstanceListeners(this.source);
  }

  async renderMarker(data: any, content: any, end = true, warehouse = false) {
    let googleMaps: any = await this.maps.loadGoogleMaps();
    const position = end ? data.end_location : data.start_location;
    const image = warehouse ? 'origin.png' : 'parcel.png';
    const title = end ? data.end_address : data.start_address;
    const oMarker = new googleMaps.Marker({
      position: position,
      map: this.map,
      icon: "https://wpcargo.com/demo/pod/wp-content/plugins/wpcargo-pod-addons/assets/img/" + image,
      title: title,
    });
    const infowindow = new googleMaps.InfoWindow({
      content: content,
    });
    oMarker.addListener("click", () => {
      infowindow.open(this.map, oMarker);
    });
  }

  async calculateAndDisplayRoute(directionsService: any, directionsRenderer: any, origin: any, destination: any, wayPoints: any, shipments: any, poo: any) {
    let googleMaps: any = await this.maps.loadGoogleMaps();
    const waypts = wayPoints;
    const summaryPanel = document.getElementById("directions-panel");
    const singleParcel = shipments.length === 1 ? true : false;
    console.log(origin.address);
    directionsService.route({
      origin: this.source,
      destination: this.dest,
      waypoints: waypts,
      optimizeWaypoints: true,
      travelMode: googleMaps.TravelMode.DRIVING,
    }).then((response: any) => {

      directionsRenderer.setDirections(response);
      const route = response.routes[0];
      if (poo) {
        var leg = response.routes[0].legs[0];
        let sContent = "<b>Point of Origin:</b><br><b>Distance: ${leg.distance.text}</b><br>${leg.start_address} <b>to</b> ${leg.end_address} ";
        this.renderMarker(leg, sContent, false, true);
      }
      // For each route, display summary information.
      for (let i = 0; i < route.legs.length; i++) {
        const routeSegment = i + 1;
        let content = `
                      <b>Route Segment: ${routeSegment}</b><br>
                      <b>Distance: ${route.legs[i].distance.text}</b><br>
                      ${route.legs[i].start_address} <b>to</b> ${route.legs[i].end_address}<br>
                      Shipment Number: <b>${shipments[i]['number']}</b><br>
                  `;
        if ('info' in shipments[i]) {
          for (const [key, value] of Object.entries(shipments[i]['info'])) {
            if (value == '') {
              continue;
            }
            content += value + "<br>";
          }
        }
        this.renderMarker(route.legs[i], content);
        if (route.legs.length === i + 1) {
          this.renderMarker(route.legs[i], content);
        }
        this.summary = '<section class="border-bottom mb-4 pb-4" >' + content + '<section>';
      }

    })
      .catch((e: any) => window.alert("Directions request failed due to "));


  }

}
