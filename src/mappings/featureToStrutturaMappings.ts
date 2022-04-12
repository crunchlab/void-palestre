import { FieldMapping } from "src/app/interfaces/fieldMapping.interface";

const featureToPalestraMappings: FieldMapping[] = [
    { "field": "id", "properties": "id", "type": "number" },
    { "field": "cap", "properties": "cap", "type": "number" },
    { "field": "palestraDigitale", "properties": "palestraDigitale", "type": "string" },
    { "field": "comune", "properties": "comune", "type": "string" },
    { "field": "indirizzo", "properties": "indirizzo", "type": "string" },
    { "field": "provincia", "properties": "provincia", "type": "string" },
   
];

export default featureToPalestraMappings;