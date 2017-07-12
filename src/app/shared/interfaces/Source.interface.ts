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