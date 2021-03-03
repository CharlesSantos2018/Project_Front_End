import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'tranform_geo_location'
})
export class TransformGeoLocationPipe implements PipeTransform {
    constructor() { }

    transform(latitude: number, longitude: number): string {
        const min_lat: number = -21.269;
        const max_lat: number = -21.211;

        const min_lng: number = -47.857;
        const max_lng: number = -47.780;

        if (((min_lat < latitude) && (latitude < max_lat)) && ((min_lng < longitude) && (longitude < max_lng))) {
            return "Localização privilegiada";
        }
        else {
            return "";
        }
    }
}