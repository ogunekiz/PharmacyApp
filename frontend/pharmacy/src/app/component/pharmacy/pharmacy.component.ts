import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PharmacyService } from '../../service/pharmacy.service';
import { Pharmacy } from '../../data/pharmacy.interface';
import L from 'leaflet';

@Component({
  selector: 'app-pharmacy',
  templateUrl: './pharmacy.component.html',
  styleUrl: './pharmacy.component.css'
})
export class PharmacyComponent implements OnInit, AfterViewInit {
  pharmacyListWithoutNumbers!: any;
  pharmacyList!: Pharmacy;
  allPharmacyData: any[] = [];

  map!: L.Map;
  defaultCity: string = '';
  selectedCity: string = '';

  userLocation!: { latitude: number, longitude: number };

  cities = [
    "TÜMÜNÜ GÖSTER",
    "BÜYÜKORHAN",
    "GEMLİK",
    "GÜRSU",
    "HARMANCIK",
    "KARACABEY",
    "KELES",
    "KESTEL",
    "MUDANYA",
    "MUSTAFAKEMALPAŞA",
    "NİLÜFER",
    "ORHANELİ",
    "ORHANGAZİ",
    "OSMANGAZİ",
    "YENİŞEHİR",
    "YILDIRIM",
    "İNEGÖL",
    "İZNİK"
  ];

  currentDate: any
  nextDate: any;

  visible: boolean = false;

  @ViewChild('mapDiv', { static: true }) mapDiv!: ElementRef;

  marker!: L.Marker;
  showDialog: boolean = false;

  first = 0;
  rows = 5;

  constructor(private service: PharmacyService) {
    this.defaultCity = 'LÜTFEN İLÇE SEÇİNİZ';
    this.selectedCity = this.defaultCity;
  }

  ngOnInit() {
    this.getPharmacyData();
    this.currentDate = new Date();
    this.nextDate = new Date(this.currentDate);
    this.nextDate.setDate(this.nextDate.getDate() + 1);
  }

  ngAfterViewInit() {
    this.initMap();
  }

  getPharmacyData() {
    this.service.getPharmacy().subscribe((res) => {
      this.allPharmacyData = Object.values(res).filter(item => typeof item === 'object');
      this.pharmacyListWithoutNumbers = this.allPharmacyData;
      this.pharmacyList = this.pharmacyListWithoutNumbers;
    });
  }

  getPharmacy(selectedValue?: string) {
    if (selectedValue && selectedValue !== 'TÜMÜNÜ GÖSTER') {
      this.pharmacyList = this.pharmacyListWithoutNumbers.filter((x: { ilce: string; }) => x.ilce === selectedValue);
    } else {
      this.pharmacyList = this.pharmacyListWithoutNumbers;
    }

    this.first = 0;
    this.rows = 5;

    this.pageChange({ first: this.first, rows: this.rows });
    this.removeMarkers();
  }

  initMap() {
    this.map = L.map(this.mapDiv.nativeElement, {
      center: [40.10184396, 29.52454896],
      zoom: 7
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    });

    tiles.addTo(this.map);

    setTimeout(function () {
      window.dispatchEvent(new Event("resize"));
    }, 500);

  }

  removeMarkers() {
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });
  }

  getNearestPharmacy() {

    this.getUserLocation()

  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        this.getNearestLocations();
      });
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

  getNearestLocations() {
    if (!this.userLocation) {
      alert("User location is not available.")
      console.log("User location is not available.");
      return;
    }

    this.pharmacyList.forEach(location => {
      const distance = this.calculateDistance(this.userLocation.latitude, this.userLocation.longitude, Number(location.enlem), Number(location.boylam));
      location.distance = distance;
    });

    this.pharmacyList.sort((a, b) => Number(a.distance) - Number(b.distance));
    this.pharmacyList = this.pharmacyList.slice(0, 3);
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  getPharmacyDatam(pharmacyData: any) {

    // this.addMarkers(pharmacyData);

    console.log(pharmacyData);
  }

  openDialog(lat: string, lng: string, pharmacy: string, tel: string) {
    this.showDialog = true;

    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);

    this.addMarker(lat, lng, pharmacy, tel);
  }

  closeDialog() {
    this.showDialog = false;
  }

  focusToLocation(lat: number, lng: number) {
    this.map.setView([lat, lng], 15);
  }

  addMarker(lat: string, lng: string, pharmacy: string, tel: string) {

    const lats = Number(lat);
    const lngs = Number(lng);

    if (this.marker) {
      this.marker.removeFrom(this.map);
    }

    const customIcon = L.icon({
      iconUrl: '../../../assets/img/pharmacy_icon.jpg',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    this.marker = L.marker([lats, lngs], { icon: customIcon }).addTo(this.map);
    this.marker.bindPopup('<b>' + pharmacy + '</b>' + '<br>' + tel);

    this.focusToLocation(lats, lngs);

  }

  next() {
    this.first = this.first + this.rows;
  }

  prev() {
    this.first = this.first - this.rows;
  }

  reset() {
    this.first = 0;
  }

  pageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
  }

  isLastPage(): boolean {
    return this.pharmacyList ? this.first === this.pharmacyList.length - this.rows : true;
  }

  isFirstPage(): boolean {
    return this.pharmacyList ? this.first === 0 : true;
  }


}

