// ------------------------------------------------------------------------------
// ----- auth.guard.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: guard to ensure user is logged in before allowing activation of route

import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from "app/shared/services/auth.service";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private _router: Router, private _authService: AuthService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        
        return this.checkLogin();  
    }
    canActivateChild(_actRoute: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
        return this.canActivate(_actRoute, _state);
    }
    
    private checkLogin():boolean {
        if (localStorage.getItem("credentials") && localStorage.getItem('setupTime') !== null && !this.checkSetupTime()) {   
            return true;
        }
        // if it gets here..they are not logged in
        // store the attempted url for redirecting
     //   this._authService.redirectUrl = url;
        this._authService.removeUserInfo();
        localStorage.clear();
        // navigate to the login page with extras
        this._router.navigate(['/login']);
        return false;
    }
    
    // need to find out if localstorage item 'setupTime' is more than 12 hours ago
    private checkSetupTime(): boolean {
        let tooOld: boolean = false;

        let twentyFourHours: number = 12*60*60*1000;
        let now: number = new Date().getTime();
        let setupTime: number = Number(localStorage.getItem('setupTime'));
        if((now - setupTime) > twentyFourHours) { // is it greater than 12 hours
            tooOld = true;
            this._authService.removeUserInfo();
        }

        return tooOld;
    }
    
   /*     if (localStorage.getItem('loggedInName')) {
            // logged in so return true
            return true;
        }

        // not logged in so redirect to login page with the return url
        this._router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
        return false;
    }*/
}