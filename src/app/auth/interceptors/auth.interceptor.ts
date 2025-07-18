import { HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "@auth/services/auth.service";


export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {

    const token = inject(AuthService).getToken();
    //console.log('Token desde interceptor: ' + token);
    const newReq = req.clone({
        headers: req.headers.append('Authorization', `Bearer ${token}`),
    });
    return next(newReq);

}