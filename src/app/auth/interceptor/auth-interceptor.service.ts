import { HttpErrorResponse, HttpEvent, HttpEventType, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, tap, throwError } from "rxjs";
import { JwtService } from "../jwt/jwt.service";

@Injectable()
export class AuthInterceptorService implements HttpInterceptor{
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);


    constructor(private jwtService: JwtService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!req.url.startsWith("http://localhost:8080/api/auth/")) {
            let token = null;
            if (typeof window !== 'undefined' && window.localStorage) {
                token = sessionStorage.getItem("accessToken")
            }
            const modifiedRequest = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return next.handle(modifiedRequest).pipe(
                catchError(error => {
                    // If error is unauthorized, attempt to refresh token.
                    if (error instanceof HttpErrorResponse && error.status === 401) {
                      return this.handle401Error(modifiedRequest, next);
                    }

                    return throwError(error);
                  })
            )
        } else {
            return next.handle(req);
        }
    }

    private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.jwtService.refreshToken().pipe(
                switchMap((tokenResponse: any) => {
                    this.isRefreshing = false;
                    this.jwtService.setTokens({accessToken: tokenResponse.token, refreshToken: tokenResponse.refreshTokenId, username: tokenResponse.username});
                    console.log(tokenResponse.token + "|" + tokenResponse.refreshTokenId);
                    this.refreshTokenSubject.next(tokenResponse.accessToken);
                    const clonedReq = req.clone({
                      setHeaders: { Authorization: `Bearer ${tokenResponse.token}` }
                    });
                    return next.handle(clonedReq);
                  }),
                  catchError(err => {
                    this.isRefreshing = false;
                    this.jwtService.logout();
                    return throwError(err);
                  })
            )
        } else {
            return this.refreshTokenSubject.pipe(
                filter(token => token != null),
                take(1),
                switchMap((newToken) => {
                  const clonedReq = req.clone({
                    setHeaders: { Authorization: `Bearer ${newToken}` }
                  });
                  return next.handle(clonedReq);
                })
              );
        }
    }
}

