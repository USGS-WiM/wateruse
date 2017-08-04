// ------------------------------------------------------------------------------
// ----- config.service..ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: service to get configuration file

import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { IConfig } from "app/shared/interfaces/Config.interface";

@Injectable()
export class ConfigService {
   private config: IConfig;
   constructor(private _http:Http) {}
  
    public load(url:string) { 
        return new Promise((resolve) => {
            this._http.get(url).map(res=>res.json()).subscribe(config => {
                    this.config = config;
                    resolve();
            });
        });
    }

    public getConfiguration():IConfig {
        return this.config;
    }
}