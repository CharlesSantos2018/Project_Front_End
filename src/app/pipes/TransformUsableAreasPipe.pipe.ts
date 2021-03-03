import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'tranform_usable_areas'
})
export class TransformUsableAreasPipe implements PipeTransform {
    constructor() { }

    transform(usable_areas: []) {
        let string_usable_areas: string = "";

        // Penúltimo item da lista
        const penultimate_item_usable_areas: never = usable_areas[usable_areas.length - 2];
        const penultimateIndexOf = usable_areas.indexOf(penultimate_item_usable_areas, (usable_areas.length - 2));
        // Último item da lista
        const last_item_usable_areas: never = usable_areas[usable_areas.length - 1];
        const lastIndexOf = usable_areas.lastIndexOf(last_item_usable_areas, (usable_areas.length - 1));
        usable_areas.forEach((usable_area, i) => {
            if (lastIndexOf == i) {
                string_usable_areas = string_usable_areas + usable_area + 'm²';
            }
            else if (i == penultimateIndexOf) {
                string_usable_areas = string_usable_areas + usable_area + ' e ';
            }
            else {
                string_usable_areas = usable_area + ', ';
            }
        });

        return string_usable_areas;
    }

}