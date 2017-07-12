import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch';
import { Subject } from "rxjs/Subject";
import { CONFIG } from "app/shared/services/CONFIG";
import { IUser } from "app/shared/interfaces/User.interface";
import { AuthService } from "app/shared/services/auth.service";

@Injectable()
export class LoginService {
    public isLoggedIn: boolean = false;

    constructor(private http: Http, private _authService: AuthService) { }
    
    public login(username: string, password: string) {  
        let headers: Headers = new Headers();
		let creds: string = "Basic " + btoa(username + ":" + password);

		headers.append("Authorization", creds);
		headers.append("Accept", "application/json");
		headers.append("Content-Type", "application/json");
        return this.http.get(CONFIG.LOGIN_URL, { headers: headers })
            .map((response: Response) => {
				// login successful if there's a jwt token in the response
				let user = response.json();
				if (user) {
					this.isLoggedIn = true;
					// store user creds in localStorage and details in service for retrieval
					localStorage.setItem('credentials', creds);
					this._authService.storeUserInfo(user);
				}
			})
			.catch(this.handleError);
    }

    public logout() {
        this.isLoggedIn = false;
		localStorage.clear();
		this._authService.removeUserInfo();
    }

    private handleError(error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}