// ------------------------------------------------------------------------------
// ----- wateruse.service..ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: services to get/store/post/put/delete via http and subjects used throughout the application

import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import 'rxjs/add/observable/throw';
import { IRegion } from "app/shared/interfaces/Region.interface";
import { ISource } from "app/shared/interfaces/Source.interface";
import { ISourceType } from "app/shared/interfaces/SourceType.interface";
import { ICategoryType } from "app/shared/interfaces/Category.interface";
import { ITimeseries } from "app/shared/interfaces/Timeseries.interface";
import { IUnitType } from "app/shared/interfaces/UnitType.interface";
import { IStatusType } from "app/shared/interfaces/StatusType.interface";
import { IRoles } from "app/shared/interfaces/Roles.interface";
import { ConfigService } from "app/config.service";
import { IConfig } from "app/shared/interfaces/Config.interface";

@Injectable()
export class WateruseService {
    public authHeader: Headers = new Headers({"Accept": "application/json", "Content-Type": "application/json", "Authorization": localStorage.getItem("credentials")});
    public jsonHeader: Headers = new Headers({"Accept": "application/json", "Content-Type": "application/json"});
    public configSettings: IConfig;

    constructor(private _http: Http, private _configService: ConfigService) {
        this.configSettings = this._configService.getConfiguration();
        this.getSourceTypes().subscribe(stypes => {
            this._sourceTypesSubject.next(stypes);
        });
        
        this.getCategoryTypes().subscribe(ctypes => {
            this._categoryTypesSubject.next(ctypes);
        });
    }
	
    // SUBJECTS //////////////////////////////////////
    private _sourcesSubject: Subject<Array<ISource>> = new Subject<Array<ISource>>();
    private _sourceTypesSubject: BehaviorSubject<Array<ISourceType>> = <BehaviorSubject<ISourceType[]>>new BehaviorSubject([]);
    private _categoryTypesSubject: BehaviorSubject<Array<ICategoryType>> = <BehaviorSubject<ICategoryType[]>>new BehaviorSubject([]);
    
    // GETTERS /////////////////////////////////////////////
    public sources(): Observable<Array<ISource>> { return this._sourcesSubject.asObservable(); }
    public sourcetypes(): Observable<Array<ISourceType>> { return this._sourceTypesSubject.asObservable(); }
    public categorytypes(): Observable<Array<ICategoryType>> { return this._categoryTypesSubject.asObservable(); }    
    
    // SETTERS ///////////////////////////////////////////
    public setSources(s:Array<ISource>) {
        this._sourcesSubject.next(s);
    }

    // http GET //////////////////////////////////////////////
    // gets resolved when coming to this route (home)
    public getRegions() {
        //return regions for logged in user        
        let options = new RequestOptions({headers: this.authHeader});
        return this._http.get(this.configSettings.baseUrl + this.configSettings.regionsURL, options)
            .map(r => <Array<IRegion>>r.json())
            .catch(this.errorHandler);
    }
    // gets all sources after region is chosen
    public getSources(regionId: string) {
        let sourceParam: URLSearchParams = new URLSearchParams();
        sourceParam.append('regionid', regionId);
        let options = new RequestOptions({headers: this.authHeader, search: sourceParam });
        return this._http.get(this.configSettings.baseUrl + this.configSettings.sourcesURL, options)
            .map(res => <Array<ISource>>res.json())
            .catch(this.errorHandler);
    }
    // dropdown values for source types for filtering
    public getSourceTypes() {
        let options = new RequestOptions({headers: this.jsonHeader});
        return this._http.get(this.configSettings.baseUrl + this.configSettings.sourceTypeURL, options)
            .map(res => <Array<ISourceType>>res.json())            
            .catch(this.errorHandler);
    }
    // dropdown values for category types for filtering
    public getCategoryTypes() {
        let options = new RequestOptions({headers: this.authHeader});
        return this._http.get(this.configSettings.baseUrl + this.configSettings.categoryTypeURL, options)
            .map(res => <Array<ICategoryType>>res.json())
            .catch(this.errorHandler);
    }
        
    
    // POST Source
    public postSource(aSource: ISource){
        let options = new RequestOptions({ headers: this.authHeader });
        return this._http.post(this.configSettings.baseUrl + this.configSettings.sourcesURL, aSource, options)
            .map(res => <ISource>res.json())
            .catch(this.errorHandler);
    }
    // POST source Batch
    public postBatchSources(regionId: number, sources: Array<any>) {
        let options = new RequestOptions({headers: this.authHeader});
        return this._http.post(this.configSettings.baseUrl + this.configSettings.regionsURL + "/" + regionId + '/Sources/Batch', sources, options)
            .map(res=> <any>res.json())
            .catch(this.errorHandler);
    }
    // POST timeseries Batch
    public postBatchTimeseries(regionId: number, timeseries: Array<ITimeseries>) {
        let options = new RequestOptions({headers: this.authHeader});
        return this._http.post(this.configSettings.baseUrl + this.configSettings.regionsURL + '/' + regionId + '/timeseries/batch', timeseries, options)
            .map(res=> <Array<ITimeseries>>res.json())
            .catch(this.errorHandler);
    }

    // PUT Source
    public putSource(id: number, aSource: ISource) {
        let options = new RequestOptions({ headers: this.authHeader });
        return this._http.put(this.configSettings.baseUrl + this.configSettings.sourcesURL + '/' + id, aSource, options)
            .map(res => <ISource>res.json())
            .catch(this.errorHandler);
    }    

    // DELETE Source
    public deleteSource(sourceID: number) {
        let options = new RequestOptions({ headers: this.authHeader });
        return this._http.delete(this.configSettings.baseUrl + this.configSettings.sourcesURL + '/' + sourceID, options)
            .catch(this.errorHandler);
    }
        
    private errorHandler(error: Response | any) {
        /* there are 3 types of errors I pass back 
        1) no body, just error code
        2) body type "string",
        3) body type "object" : keyval pair (just used for TS and source batch) */
        
        if (error._body !== "")
            error._body = JSON.parse(error._body);

	    return Observable.throw(error);
    }
}