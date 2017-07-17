// ------------------------------------------------------------------------------
// ----- Timeseries.interface.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: interface for timeseries

export interface ITimeseries {
    FacilityCode: string;
    date: Date;
    value: number;
    unitTypeID?: number;
}