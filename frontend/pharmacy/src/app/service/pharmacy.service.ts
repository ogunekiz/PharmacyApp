import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PharmacyService {

  private apiUrl = 'node.js ile olsturmus oldugum backend url'

  constructor(private http: HttpClient) { }

  getPharmacy(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getpharmacies`)
  }

}
