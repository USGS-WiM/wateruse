// ------------------------------------------------------------------------------
// ----- IUser.interface.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: interface for user

export  interface IUser {
    id?: number;
    username: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    roleID?: number;
}