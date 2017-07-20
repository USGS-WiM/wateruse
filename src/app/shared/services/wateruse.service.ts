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

import { CONFIG } from "app/shared/services/CONFIG";
import { IRegion } from "app/shared/interfaces/Region.interface";
import { ISource } from "app/shared/interfaces/Source.interface";
import { ISourceType } from "app/shared/interfaces/SourceType.interface";
import { ICategoryType } from "app/shared/interfaces/Category.interface";
import { ITimeseries } from "app/shared/interfaces/Timeseries.interface";
import { IUnitType } from "app/shared/interfaces/UnitType.interface";
import { IStatusType } from "app/shared/interfaces/StatusType.interface";
import { IRoles } from "app/shared/interfaces/Roles.interface";

@Injectable()
export class WateruseService {

    constructor(private _http: Http) {
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
        let options = new RequestOptions({headers: CONFIG.JSON_AUTH_HEADERS});
        return this._http.get(CONFIG.REGIONS_URL, options)
            .map(r => <Array<IRegion>>r.json())
            .catch(this.errorHandler);
    }
    // gets all sources after region is chosen
    public getSources(regionId: string) {
        let sourceParam: URLSearchParams = new URLSearchParams();
        sourceParam.append('regionid', regionId);
        let options = new RequestOptions({headers: CONFIG.JSON_AUTH_HEADERS, search: sourceParam });
        return this._http.get(CONFIG.SOURCES_URL, options)
            .map(res => <Array<ISource>>res.json())
            .subscribe(s => {this._sourcesSubject.next(s);},
            error => this.errorHandler);
    }
    // dropdown values for source types for filtering
    public getSourceTypes() {
        let options = new RequestOptions({headers: CONFIG.JSON_HEADERS});
        return this._http.get(CONFIG.SOURCETYPES_URL, options)
            .map(res => <Array<ISourceType>>res.json())            
            .catch(this.errorHandler);
    }
    // dropdown values for category types for filtering
    public getCategoryTypes() {
        let options = new RequestOptions({headers: CONFIG.JSON_AUTH_HEADERS});
        return this._http.get(CONFIG.CATEGORYTYPES_URL, options)
            .map(res => <Array<ICategoryType>>res.json())
            .catch(this.errorHandler);
    }
        
    
    // POST Source
    public postSource(aSource: ISource){
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.post(CONFIG.SOURCES_URL, aSource, options)
            .map(res => <ISource>res.json())
            .catch(this.errorHandler);
    }
    // POST source Batch
    public postBatchSources(regionId: number, sources: Array<any>) {
        let options = new RequestOptions({headers:CONFIG.JSON_AUTH_HEADERS});
        return this._http.post(CONFIG.SOURCES_URL + '/batch', sources, options)
            .map(res=> <Array<ITimeseries>>res.json())
            .catch(this.errorHandler);
    }
    // POST timeseries Batch
    public postBatchTimeseries(regionId: number, timeseries: Array<ITimeseries>) {
        let options = new RequestOptions({headers:CONFIG.JSON_AUTH_HEADERS});
        return this._http.post(CONFIG.REGIONS_URL + '/' + regionId + '/timeseries/batch', timeseries, options)
            .map(res=> <Array<ITimeseries>>res.json())
            .catch(this.errorHandler);
    }

    // PUT Source
    public putSource(id: number, aSource: ISource) {
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.put(CONFIG.SOURCES_URL + '/' + id, aSource, options)
            .map(res => <ISource>res.json())
            .catch(this.errorHandler);
    }    

    // DELETE Source
    public deleteSource(sourceID: number) {
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.delete(CONFIG.SOURCES_URL + '/' + sourceID, options)
            .catch(this.errorHandler);
    }
        
    private errorHandler(error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}