// ------------------------------------------------------------------------------
// ----- wateruse.service..ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: services to get/store/post/put/delete via http and subjects used throughout the application

import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs/BehaviorSubject";

@Injectable()
export class LoadingService {

    constructor() {}
    
    // show/hide loading div
    private _loadingSubj: BehaviorSubject<boolean> = <BehaviorSubject<boolean>>new BehaviorSubject(false);
    // setter
    public setLoading(val: any) {
        this._loadingSubj.next(val);
    }
    //getter
    public get getLoading(): any {
        return this._loadingSubj.asObservable();
    }
}