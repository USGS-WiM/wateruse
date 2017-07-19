// ------------------------------------------------------------------------------
// ----- Toast.interface.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: interface for toast notifications

export interface IToast {
    ngClassName: string;
    message: string;
    showToast: boolean;
}