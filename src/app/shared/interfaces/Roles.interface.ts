// ------------------------------------------------------------------------------
// ----- Roles.interface.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: interface for user

export  interface IRoles {
    id?: number;
    name: string;
    description: string;
    isEditing?:boolean;
}