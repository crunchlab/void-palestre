import { Injectable } from '@angular/core';
import { find, flatten, get, pick, uniq } from 'lodash';
import { FeatureToPalestraService } from '../transformer/feature-to-struttura.service';

import strutture from '../../../assets/data/strutture.json';
import { AttributeFilter } from '../../interfaces/attributeFilter.interface';
import { FieldMapping } from '../../interfaces/fieldMapping.interface';
import { FilterOperator } from '../../enums/filterOperator.enum';
import { environment } from '../../../environments/environment';
import { Palestra } from 'src/app/models/struttura/palestra';
@Injectable({
    providedIn: 'root'
})
export class StrutturaService {
    palestre: Palestra[] = [];
    mappings: FieldMapping[] = environment.filtersFieldMappings;


    constructor(private transformer: FeatureToPalestraService) {
        this.palestre = strutture.features.map((f: any) => this.transformer.featureToPalestra(f));
    }


    public getDetail(id: string | number): Palestra {
        let palestra: Palestra = find(this.palestre, (p: Palestra) => p.id == (id as number)) as Palestra;
        return palestra;
    }

    /**
     *  Loops over all the strutture and returns distinct values for mapped properties
     * @param fieldMappings 
     * @returns 
     */
    public getFilterValues(): AttributeFilter[] {
        let filters: AttributeFilter[] = []
        filters = this.mappings.map((mapping: FieldMapping) => {
            let filter: AttributeFilter = { property: '', value: '', operator: FilterOperator.in };
            let values: any = this.palestre.map((s: Palestra) => {
                if (Array.isArray(mapping.properties)) {
                    return pick(s, mapping.properties);
                } else {
                    return get(s, mapping.properties)
                }
            });

            // must keep only true value if any
            if (mapping.type == "bool") {
                values = values.map(v => Object.keys(v));
            }
            filter.value = (uniq(flatten(values)) as string[]).sort();
            filter.property = mapping.field;
            return filter;
        });
        return filters;
    }
}
