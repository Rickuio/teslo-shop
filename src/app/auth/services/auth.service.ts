
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthResponse } from '@auth/interfaces/auth-response.interface';
import { User } from '@auth/interfaces/user.interface';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

type AuthStatus = 'checking' | 'auth' | 'not-auth';
const baseUrl = environment.baseUrl;

@Injectable({providedIn: 'root'})
export class AuthService {

    private _user = signal<User | null>(null);
    private _token = signal<string | null>(localStorage.getItem('token'));
    private _authStatus = signal<AuthStatus>('checking');

    private http = inject(HttpClient);
    private router = inject(Router);

    checkStatusResource = rxResource({
        loader: () => this.checkStatus()
    });

    getStatus = computed<AuthStatus>( () => {
        if (this._authStatus() === 'checking') return 'checking';
        if (this._user()) {
            return 'auth';
        }
        return 'not-auth';
    });

    getUser = computed<User|null>( () => this._user());
    getToken = computed(this._token);
    isAdmin = computed( () => this._user()?.roles.includes('admin') ?? false);

    login (mail: string, pass: string): Observable<boolean> {
        return this.http.post<AuthResponse>(`${baseUrl}/auth/login`, {
            email: mail,
            password: pass
        }).pipe(
            map((resp) => this.handleAuthSuccessObs(resp)),
            catchError((err) => this.handleAuthErrorObs(err))
        );
    }

    register (mail: string, pass: string, name: string): Observable<boolean> {
        return this.http.post<AuthResponse>(`${baseUrl}/auth/register`, {
            email: mail,
            password: pass,
            fullName: name,
        }).pipe(
            map((resp) => this.handleAuthSuccessObs(resp)),
            catchError((err) => this.handleAuthErrorObs(err))
        );
    }

    checkStatus():Observable<boolean> {

        const token = localStorage.getItem('token');
        
        if (!token) {
            this.logout();
            return of(false);
        }

        // TODO: Implementar cache para is-admin.guard.ts

        return this.http.get<AuthResponse>(`${baseUrl}/auth/check-status`,{
            // headers: {
            //     Authorization: `Bearer ${token}`,
            // },
            }).pipe(
            tap( (resp) => {
                this.handleAuthSuccessDetail(resp);
            }),
            map(() => true),
            catchError((err:any) => {
                console.log('Error Authorization ---> ');
                this.handleAuthErrorDetail(err);
                return of(false);
            })
        );
    }

    logout() {
        this._user.set(null);
        this._token.set(null);
        this._authStatus.set('not-auth');
        localStorage.removeItem('token');
    }

    logoutAdmin() {
        this.logout();
        this.router.navigateByUrl('/');
    }

    private handleAuthSuccessObs(resp: AuthResponse) {
        this._user.set(resp.user);
        this._token.set(resp.token);
        this._authStatus.set('auth');
        localStorage.setItem('token', resp.token);
        return true;
    }

    private handleAuthErrorObs(error: any) {
        this.logout();
        return of(false);
    }

    private handleAuthSuccessDetail(resp: AuthResponse) {
        this._user.set(resp.user);
        this._token.set(resp.token);
        this._authStatus.set('auth');
        localStorage.setItem('token', resp.token);
    }

    private handleAuthErrorDetail(error: any) {
        if (error.status == '401') {
            console.log('Credenciales incorrectas');
        }else {
            console.error('Error desconocido Auth');
        }
        this.logout();
    }

}