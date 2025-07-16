
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthResponse } from '@auth/interfaces/auth-response.interface';
import { User } from '@auth/interfaces/user.interface';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

type AuthStatus = 'checking' | 'auth' | 'not-auth';
const baseUrl = environment.baseUrl;

@Injectable({providedIn: 'root'})
export class AuthService {

    private _authStatus = signal<AuthStatus>('checking');
    private _user = signal<User | null>(null);
    private _token = signal<string | null>(null);

    private http = inject(HttpClient);

    getStatus = computed<AuthStatus>( () => {
        if (this._authStatus() === 'checking') return 'checking';
        if (this._user()) {
            return 'auth';
        }
        return 'not-auth';
    })

    getUser = computed<User|null>( () => this._user());
    getToken = computed(this._token);

    login (mail: string, pass: string): Observable<boolean> {
        return this.http.post<AuthResponse>(`${baseUrl}/auth/login`,{
            email: mail,
            password: pass
        }).pipe(
            tap(resp => {
                this._user.set(resp.user);
                this._authStatus.set('auth');
                this._token.set(resp.token);
                localStorage.setItem('token', resp.token);
            }),
            map(() => true),
            catchError((err) => {
                this._user.set(null);
                this._token.set(null);
                this._authStatus.set('not-auth');
                if (err.status == '401') {
                    console.log('Credenciales incorrectas');
                }else {
                    console.error('Error desconocido');
                }
                return of(false);
            })
        );
    }

}