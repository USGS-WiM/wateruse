// ------------------------------------------------------------------------------
// ----- Source.interface.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: interface for source 

import { ILocation } from "app/shared/interfaces/Location.interface";

export interface ISource {
    id?: number;
    name?: string;
    facilityName: string;
    facilityCode: string;
    stationID?: string;
    catagoryTypeID?: number;
    sourceTypeID?: number;
    regionID: number;    
    location?: ILocation;
}