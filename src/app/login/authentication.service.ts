import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import { Subject } from "rxjs/Subject";
import { CONFIG } from "app/shared/services/CONFIG";
import { IRegion } from "app/shared/interfaces/Region.interface";

@Injectable()
export class AuthenticationService {
    public isLoggedIn: boolean = false;

    constructor(private http: Http) { }
    
    login(username: string, password: string) {  

        let options = new RequestOptions({headers: CONFIG.JSON_AUTH_HEADERS});
        return this.http.get(CONFIG.REGIONS_URL + "/4", options)
            .map(response => <IRegion>response.json())                
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
    }
}