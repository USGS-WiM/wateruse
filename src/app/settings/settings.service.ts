// ------------------------------------------------------------------------------
// ----- settings.service..ts -----------------------------------------------
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
import { ISourceType } from "app/shared/interfaces/SourceType.interface";
import { ICategoryType } from "app/shared/interfaces/Category.interface";
import { IUnitType } from "app/shared/interfaces/UnitType.interface";
import { IStatusType } from "app/shared/interfaces/StatusType.interface";
import { IRoles } from "app/shared/interfaces/Roles.interface";

@Injectable()
export class SettingsService {
    constructor(private _http: Http) {}

    // SUBJECTS //////////////////////////////////////
    private _regionSubject: BehaviorSubject<Array<IRegion>> = <BehaviorSubject<IRegion[]>>new BehaviorSubject([]);
    private _sourceTypesSubject: BehaviorSubject<Array<ISourceType>> = <BehaviorSubject<ISourceType[]>>new BehaviorSubject([]);
    private _categoryTypesSubject: BehaviorSubject<Array<ICategoryType>> = <BehaviorSubject<ICategoryType[]>>new BehaviorSubject([]);
    private _unitTypesSubject: BehaviorSubject<Array<IUnitType>> = <BehaviorSubject<IUnitType[]>>new BehaviorSubject([]);
    private _statusTypesSubject: BehaviorSubject<Array<IStatusType>> = <BehaviorSubject<IStatusType[]>>new BehaviorSubject([]);
    private _rolesSubject: BehaviorSubject<Array<IRoles>> = <BehaviorSubject<IRoles[]>>new BehaviorSubject([]);

    // GETTERS /////////////////////////////////////////////
    public regions(): Observable<Array<IRegion>> { return this._regionSubject.asObservable(); }
    public sourcetypes(): Observable<Array<ISourceType>> { return this._sourceTypesSubject.asObservable(); }
    public categorytypes(): Observable<Array<ICategoryType>> { return this._categoryTypesSubject.asObservable(); }    
    public unittypes(): Observable<Array<IUnitType>> { return this._unitTypesSubject.asObservable(); }
    public statustypes(): Observable<Array<IStatusType>> { return this._statusTypesSubject.asObservable(); }
    public roles(): Observable<Array<IRoles>> { return this._rolesSubject.asObservable(); }
    
    // HTTP REQUESTS ////////////////////////////////////
    
    // ------------ GETS ---------------------------
    public getEntities(url:string){
        let options = new RequestOptions({headers: CONFIG.JSON_AUTH_HEADERS});
        return this._http.get(CONFIG[url], options)
            .map(response => <Array<any>>response.json())
    }
    

    // ------------ POSTS ------------------------------    
    public postEntity(entity: object, url: string){
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.post(CONFIG[url], entity, options)
            .map(res => <any>res.json())
            .catch(this.errorHandler);
    }

    // ------------ PUTS --------------------------------    
    public putEntity(id: number, entity: any, url: string){
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.put(CONFIG[url] + '/' + id, entity, options)
            .map(res => <any>res.json())
            .catch(this.errorHandler);
    }
        
    // ------------ DELETES ------------------------------
    public deleteEntity(id: number, url: string){
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.delete(CONFIG[url] + '/' + id, options)
            .catch(this.errorHandler);
    }
        
    
    private errorHandler(error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg);
        return Observable.throw(errMsg);
    }

    // SETTERS ///////////////////////////////////////////
    public setRegions(r:Array<IRegion>) {
        this._regionSubject.next(r);
    }
    public setCategories(c: Array<ICategoryType>){
        this._categoryTypesSubject.next(c);
    }
    public setSourceTypes(s: Array<ISourceType>){
        this._sourceTypesSubject.next(s);
    }
    public setRoles(r: Array<IRoles>){
        this._rolesSubject.next(r);
    }
    public setUnitTypes(u: Array<IUnitType>){
        this._unitTypesSubject.next(u);
    }
    public setStatusTypes(s: Array<IStatusType>){
        this._statusTypesSubject.next(s);
    }
    
    // MODALS ////////////////////////////////////
    // region for the modal
    private _modalRegionSubj: BehaviorSubject<IRegion> = <BehaviorSubject<IRegion>>new BehaviorSubject({});
    // setter
    public setModalRegion(val: any) {
        this._modalRegionSubj.next(val);
    }
    // getter
    public get regionForModal(): any {
        return this._modalRegionSubj.asObservable();
    }

    // modal for editing source
    private _regionModalSubj: BehaviorSubject<boolean> = <BehaviorSubject<boolean>>new BehaviorSubject(false);
    // setter
    public setRegionModal(val: any) {
        this._regionModalSubj.next(val);
    }
    //getter
    public get showRegionModal(): any {
        return this._regionModalSubj.asObservable();
    }
}