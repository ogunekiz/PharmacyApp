import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PharmacyComponent } from './component/pharmacy/pharmacy.component';

const routes: Routes = [
  { path: '', component: PharmacyComponent }
  // { path: 'pharmacy', component: PharmacyComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
