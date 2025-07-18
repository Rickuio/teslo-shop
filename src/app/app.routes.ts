import { Routes } from '@angular/router';
import { NotAuthGuard } from '@auth/guards/not-auth.guard';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes'),
        canMatch: [
            NotAuthGuard,
            // () => { 
            //     console.log('Desde Guard');
            //     return false;
            // }
        ]
    },
    {
        path: '',
        loadChildren: () => import('./store-front/store-front.routes'),
    },
    {
        path: '**',
        redirectTo: '/',
    }
];
