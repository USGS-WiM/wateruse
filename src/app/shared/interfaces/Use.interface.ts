// ------------------------------------------------------------------------------
// ----- Use.interface.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Katrin Jacobsen - USGS Web Informatics and Mapping
// purpose: interface for use type

export interface IUseType {
    id?: number;
    name: string;
    code: string;
    description: string;
    isEditing?:boolean;
}