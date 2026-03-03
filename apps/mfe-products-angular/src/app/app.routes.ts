import { Routes } from '@angular/router';
import { ListComponent } from './pages/list/list.component';
import { DetailsComponent } from './pages/details/details.component';

export const routes: Routes = [
  { path: '', component: ListComponent },
  { path: 'details/:id', component: DetailsComponent }
];
