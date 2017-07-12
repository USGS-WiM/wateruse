import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IUser } from "app/shared/interfaces/User.interface";
import { LoginService } from "app/login/login.service";

// import { AlertService, AuthenticationService } from '../_services/index';
//http://jasonwatmore.com/post/2016/09/29/angular-2-user-registration-and-login-example-tutorial

@Component({
    moduleId: module.id,
    templateUrl: 'login.component.html'
})

export class LoginComponent implements OnInit {
    user: IUser;
    loading = false;
    returnUrl: string;

    constructor(
        private _route: ActivatedRoute, private _router: Router, private _loginService: LoginService
    //    private alertService: AlertService
    ) { }

    ngOnInit() {
        this.user = { username: '', password: ''};
        // reset login status
        this._loginService.logout();
        localStorage.clear();

        // get return url from route parameters or default to '/'
        this.returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/';
    }

    login() {
        this.loading = true;
        let creds: string = "Basic " + btoa(this.user.username + ":" + this.user.password);
        localStorage.setItem('credentials', creds);
        
        this._loginService.login(this.user.username, this.user.password).subscribe(() => {
            if (this._loginService.isLoggedIn) {
                 this._router.navigate([this.returnUrl]);
            }
        }, (error) => {
            this.loading = false;
        });
    }
}