import { Injectable } from '@angular/core';
import { Feature, Geometry } from 'geojson';
import { FieldMapping } from '../../interfaces/fieldMapping.interface';
import { environment } from '../../../environments/environment';
import { get, pick } from "lodash";
import { Palestra } from 'src/app/models/struttura/palestra';
@Injectable({
    providedIn: 'root'
})
export class FeatureToPalestraService {
    /** Object used to map feature properties to struttura fields */
    mappings: FieldMapping[] = environment.fieldMappings;

    /**
     * Maps the feature.properties elements to the field of a Struttura instance
     * @param feature: Feature
     */
    public featureToPalestra(feature: Feature<Geometry, { [name: string]: any; }>): Palestra {

        let palestra: Palestra = new Palestra();
        this.mappings.map((mapping: FieldMapping) => {
            if (Array.isArray(mapping.properties)) {
                palestra[mapping.field] = pick((feature.properties || feature), mapping.properties);
            } else {
                palestra[mapping.field] = get((feature.properties || feature), mapping.properties);
            }
        });
        return palestra;
    }
    constructor() { }
}
