import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { IUser } from "app/shared/interfaces/User.interface";
import { CONFIG } from "app/shared/services/CONFIG";
import { IRegion } from "app/shared/interfaces/Region.interface";

@Injectable()
export class WateruseService {
    constructor(private _http: Http) { }

    // gets resolved when coming to this route (home)
    public getRegions() {
        //return regions for logged in user
        let options = new RequestOptions({headers: CONFIG.JSON_AUTH_HEADERS});
        return this._http.get(CONFIG.REGIONS_URL, options)
            .map(r => <Array<IRegion>>r.json())
    }
}