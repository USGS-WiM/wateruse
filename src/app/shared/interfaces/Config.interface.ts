// ------------------------------------------------------------------------------
// ----- Config.interface.ts -----------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2017 WiM - USGS
// authors:  Tonia Roddick - USGS Wisconsin Internet Mapping
// purpose: interface for the externally referenced config file holding baseUrl

export interface IConfig {
    baseUrl: string;
    loginURL:  string;
    regionsURL:  string;
    sourcesURL:  string;
    sourceTypeURL:  string;
    categoryTypeURL:  string;
    unitTypesURL:  string;
    statusTypesURL:  string;
    rolesURL:  string;
}