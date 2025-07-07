import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'front',
        loadChildren: () => import('./store-front/store-front.routes'),
    },
    {
        path: '**',
        redirectTo: '/'
    }
];
