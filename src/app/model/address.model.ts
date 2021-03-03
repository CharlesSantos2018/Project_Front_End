import { GeoLocation } from "./geo-location.model";

export interface Address {
    city: string;
    district: string;
    geo_location: GeoLocation;
}