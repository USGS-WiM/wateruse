// ------------------------------------------------------------------------------
// ----- CONFIG.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: configuration file containing static url strings and the baseURL for the REST services being accessed

import {Injectable} from "@angular/core";
import {Headers}    from "@angular/http";

@Injectable()
export class CONFIG {
//    private static baseURL: string = "https://test.streamstats.usgs.gov/wateruseservices/"; 
    private static baseURL: string = "http://localhost:5000/"; 

    // login
    public static get LOGIN_URL(): string { return this.baseURL + "login";};

    // regions
    public static get REGIONS_URL(): string { return this.baseURL + "Regions" };
    public static get SOURCES_URL(): string { return this.baseURL + "Sources" };
    public static get SOURCETYPES_URL(): string { return this.baseURL + "SourceTypes" };
    public static get CATEGORYTYPES_URL(): string { return this.baseURL + "Categories" };    
    public static get UNITTYPES_URL(): string { return this.baseURL + "Units" };
    public static get STATUSTYPES_URL(): string { return this.baseURL + "Status" };
    public static get ROLES_URL(): string { return this.baseURL + "Roles" };

    // headers
    public static get MIN_JSON_HEADERS() { return new Headers({ "Accept": "application/json" }); };
    public static get JSON_HEADERS() { return new Headers({ "Accept": "application/json", "Content-Type": "application/json" }); };
    public static get JSON_AUTH_HEADERS() { return new Headers({"Accept": "application/json", "Content-Type": "application/json", "Authorization": localStorage.getItem("credentials")}); };

}