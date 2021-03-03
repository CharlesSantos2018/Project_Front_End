import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Product } from "../model/product.model";

@Injectable()
export class ProductService {
    constructor(private httpClient: HttpClient) { }

    getProducts(): Observable<Product[]> {
        const url = 'https://static-content.bivilabs.com.br/challenges/products.json';
        return this.httpClient.get<Product[]>(url);
    }
}