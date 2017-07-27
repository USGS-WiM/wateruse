// ------------------------------------------------------------------------------
// ----- login.component.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: login page

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IUser } from "app/shared/interfaces/User.interface";
import { LoginService } from "app/login/login.service";
import { ToasterService } from "angular2-toaster/angular2-toaster";

@Component({
    moduleId: module.id,
    templateUrl: 'login.component.html'
})

export class LoginComponent implements OnInit {
    user: IUser;
    loading = false;
    returnUrl: string;

    constructor(
        private _route: ActivatedRoute, private _router: Router, private _loginService: LoginService, private _toastService: ToasterService) { }

    ngOnInit() {
        this.user = { username: '', password: ''};
        // reset login status
        this._loginService.logout();
        localStorage.clear();

        // get return url from route parameters or default to '/'
        this.returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/';
    }
    // log user in, navigate to home
    public login() {
        this.loading = true; // not using this yet
        this._loginService.login(this.user.username, this.user.password).subscribe(() => {
            if (this._loginService.isLoggedIn) {
                 this._router.navigate([this.returnUrl]);
            }
            this.loading = false; // not using this yet
        }, (error) => {
            this._toastService.pop('error', 'Error', error.statusText);     
            this.loading = false;
        });
    }
}