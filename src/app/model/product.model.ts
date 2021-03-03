import { Address } from "./address.model";
import { Units } from "./units.model";

export interface Product {
    name: string;
    photos: string[];
    address: Address;
    units: Units;
}