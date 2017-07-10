import {Injectable} from "@angular/core";
import {Headers}    from "@angular/http";

@Injectable()
export class CONFIG {
    private static baseURL: string = "https://test.streamstats.usgs.gov/wateruseservices/"; 

    // login
    public static get LOGIN_URL(): string { return this.baseURL + "login";};

    // regions
    public static get REGIONS_URL(): string { return this.baseURL + "Regions"};

    // headers
    public static get MIN_JSON_HEADERS() { return new Headers({ "Accept": "application/json" }); };
    public static get JSON_HEADERS() { return new Headers({ "Accept": "application/json", "Content-Type": "application/json" }); };
    public static get JSON_AUTH_HEADERS() { return new Headers({"Accept": "application/json", "Content-Type": "application/json", "Authorization": localStorage.getItem("credentials")}); };

}