import filtersFieldMappings from "../mappings/filtersFieldMappings";
import featureToPalestraMappings from "../mappings/featureToStrutturaMappings";

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
export const environment = {
    production: false,
    fieldMappings: featureToPalestraMappings,
    filtersFieldMappings: filtersFieldMappings,
    mapStyle: './assets/map-styles/osm-style.json',
    dataPointColorMap: './assets/map-styles/data-points-colors.json',
    version: "0.0.1-alpha"
    // mapStyle: './assets/map-styles/dark-style.json'

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
