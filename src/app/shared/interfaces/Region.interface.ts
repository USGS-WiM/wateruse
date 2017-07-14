// ------------------------------------------------------------------------------
// ----- Region.interface.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: interface for region that a source is in

export interface IRegion {
    id?: number;
    name: string;
    description: string;
    categoryCoefficients?: any;
    regionManagers?: any;
    sources?: any
}