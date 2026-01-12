import { Routes } from '@angular/router';

import { ScanPageComponent } from './pages/scan-page/scan-page.component';
import { WritePageComponent } from './pages/write-page/write-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'scan' },
  { path: 'scan', component: ScanPageComponent },
  { path: 'write', component: WritePageComponent },
  { path: '**', redirectTo: 'scan' }
];
