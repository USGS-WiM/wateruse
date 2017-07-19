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
    constructor(private _http: Http) {
        this.getSourceTypes();
        this.getCategoryTypes();
     }

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
    public getRegions() {
        //return regions for logged in user
        let options = new RequestOptions({headers: CONFIG.JSON_AUTH_HEADERS});
        return this._http.get(CONFIG.REGIONS_URL, options)
            .map(r => <Array<IRegion>>r.json())
    }
    public getSourceTypes() {
        let options = new RequestOptions({headers: CONFIG.JSON_HEADERS});
        return this._http.get(CONFIG.SOURCETYPES_URL, options)
            .map(res => <Array<ISourceType>>res.json())            
            .catch(this.errorHandler);
    }
    public getCategoryTypes() {
        let options = new RequestOptions({headers: CONFIG.JSON_AUTH_HEADERS});
        return this._http.get(CONFIG.CATEGORYTYPES_URL, options)
            .map(res => <Array<ICategoryType>>res.json())
            .catch(this.errorHandler);
    }
    public getUnitTypes() {
        let options = new RequestOptions({headers: CONFIG.JSON_AUTH_HEADERS});
        return this._http.get(CONFIG.UNITTYPES_URL, options)
            .map(res => <Array<IUnitType>>res.json())
            .catch(this.errorHandler);
    }
    public getStatusTypes() {
        let options = new RequestOptions({headers: CONFIG.JSON_AUTH_HEADERS});
        return this._http.get(CONFIG.STATUSTYPES_URL, options)
            .map(res => <Array<IStatusType>>res.json())
            .catch(this.errorHandler);
    }
    public getRoles() {
        let options = new RequestOptions({headers: CONFIG.JSON_AUTH_HEADERS});
        return this._http.get(CONFIG.ROLES_URL, options)
            .map(res => <Array<IRoles>>res.json())
            .catch(this.errorHandler);
    }        

    // ------------ POSTS ------------------------------    
    public postRegion(aRegion: IRegion){
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.post(CONFIG.REGIONS_URL, aRegion, options)
            .map(res => <IRegion>res.json())
            .catch(this.errorHandler);
    }
    public postCategory(aCategory: ICategoryType){
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.post(CONFIG.CATEGORYTYPES_URL, aCategory, options)
            .map(res => <ICategoryType>res.json())
            .catch(this.errorHandler);
    }
    public postSourceType(aSourceType: ISourceType){
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.post(CONFIG.SOURCETYPES_URL, aSourceType, options)
            .map(res => <ISourceType>res.json())
            .catch(this.errorHandler);
    }
    public postRole(aRole: IRoles){
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.post(CONFIG.ROLES_URL, aRole, options)
            .map(res => <IRoles>res.json())
            .catch(this.errorHandler);
    }
    public postUnitType(aUType: IUnitType){
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.post(CONFIG.UNITTYPES_URL, aUType, options)
            .map(res => <IUnitType>res.json())
            .catch(this.errorHandler);
    }
    public postStatusType(aSType: IUnitType){
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.post(CONFIG.STATUSTYPES_URL, aSType, options)
            .map(res => <IStatusType>res.json())
            .catch(this.errorHandler);
    }
    // ------------ PUTS --------------------------------    
    public putRegion(id: number, aRegion: IRegion) {
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.put(CONFIG.REGIONS_URL + '/' + id, aRegion, options)
            .map(res => <IRegion>res.json())
            .catch(this.errorHandler);
    }
    public putCategory(id: number, aCatgory: ICategoryType) {
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.put(CONFIG.CATEGORYTYPES_URL + '/' + id, aCatgory, options)
            .map(res => <ICategoryType>res.json())
            .catch(this.errorHandler);
    }
    public putSourceType(id: number, aSourceType: ISourceType) {
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.put(CONFIG.SOURCETYPES_URL + '/' + id, aSourceType, options)
            .map(res => <ISourceType>res.json())
            .catch(this.errorHandler);
    }
    public putRole(id: number, aRole: IRoles) {
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.put(CONFIG.ROLES_URL + '/' + id, aRole, options)
            .map(res => <IRoles>res.json())
            .catch(this.errorHandler);
    }
    public putUnitType(id: number, auType: IUnitType) {
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.put(CONFIG.UNITTYPES_URL + '/' + id, auType, options)
            .map(res => <IUnitType>res.json())
            .catch(this.errorHandler);
    }
    public putStatusType(id: number, stType: IStatusType) {
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.put(CONFIG.STATUSTYPES_URL + '/' + id, stType, options)
            .map(res => <IStatusType>res.json())
            .catch(this.errorHandler);
    }
    // ------------ DELETES ------------------------------
    public deleteRegion(regionID: number) {
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.delete(CONFIG.REGIONS_URL + '/' + regionID, options)
            .catch(this.errorHandler);
    }
    public deleteCategory(categoryID: number) {
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.delete(CONFIG.CATEGORYTYPES_URL + '/' + categoryID, options)
            .catch(this.errorHandler);
    }
    public deleteSourceType(sourceTypeId: number) {
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.delete(CONFIG.SOURCETYPES_URL + '/' + sourceTypeId, options)
            .catch(this.errorHandler);
    }
    public deleteRole(roleId: number) {
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.delete(CONFIG.ROLES_URL + '/' + roleId, options)
            .catch(this.errorHandler);
    }
    public deleteUnitType(utID: number) {
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.delete(CONFIG.UNITTYPES_URL + '/' + utID, options)
            .catch(this.errorHandler);
    }
    public deleteStatusType(stID: number) {
        let options = new RequestOptions({ headers: CONFIG.JSON_AUTH_HEADERS });
        return this._http.delete(CONFIG.STATUSTYPES_URL + '/' + stID, options)
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