import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IUser } from "app/shared/interfaces/User.interface";
import { AuthenticationService } from "app/login/authentication.service";

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
        private _route: ActivatedRoute, private _router: Router, private _authenticationService: AuthenticationService
    //    private alertService: AlertService
    ) { }

    ngOnInit() {
        this.user = { username: '', password: ''};
        // reset login status
        this._authenticationService.logout();
        localStorage.clear();

        // get return url from route parameters or default to '/'
        this.returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/';
    }

    login() {
        this.loading = true;
        let creds: string = "Basic " + btoa(this.user.username + ":" + this.user.password);
        localStorage.setItem('credentials', creds);
        
        this._authenticationService.login(this.user.username, this.user.password)
            .subscribe(
                data => {
                    let creds: string = "Basic " + btoa(this.user.username + ":" + this.user.password);
                //    localStorage.setItem('credentials', creds);
                    localStorage.setItem('currentUser', "Test Admin");
                    this._router.navigate([this.returnUrl]);
                },
                error => {
                //    this.alertService.error(error);
                    this.loading = false;
                });
    }
}