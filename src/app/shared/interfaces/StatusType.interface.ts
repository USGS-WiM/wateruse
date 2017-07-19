// ------------------------------------------------------------------------------
// ----- UnitType.interface.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: interface for unit type

export interface IStatusType {
    id: number;
    name: string;
    code: string;
    description:string;
    isEditing?:boolean;
}