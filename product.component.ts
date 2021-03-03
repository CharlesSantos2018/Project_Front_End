import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { isArray, isNullOrUndefined } from 'util';
import { Product } from '../model/product.model';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductComponent implements OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  dataSource: MatTableDataSource<Product>;
  displayedColumns: string[] = ['product'];
  list_new_products: [] = [];

  constructor(
    private productService: ProductService,
  ) {
    this.dataSource = new MatTableDataSource<Product>();
  }

  ngOnInit() {
    this.productService.getProducts().subscribe(
      resp => {
        this.list_new_products = resp['products'];
        this.list_new_products = this.geo_location_treatment(this.list_new_products);
        this.list_new_products = this.treatment_latitude_and_longitude(this.list_new_products);
        this.list_new_products = this.treatment_usable_areas(this.list_new_products);
        this.list_new_products = this.treatment_in_suites(this.list_new_products);

        this.dataSource.data = this.list_new_products;
        this.dataSource.paginator = this.paginator;
      });
  }

  //#region Tratando geo localização
  // Empreendimentos sem geolocalização (chave geo_location) ou com valores nulos deverão ser desconsiderados.
  geo_location_treatment(products: []): [] {
    const products_with_geo_location: [] = []; //Produtos com a chave de geo_location com informação

    products.forEach(product => { // Passando pela lista de produtos
      const geo_location = product['address']['geo_location'];
      if (!isNullOrUndefined(geo_location)) { // Aceita produtos que contém a chave de geo_location
        const latitude = product['address']['geo_location']['latitude'];
        const longitude = product['address']['geo_location']['longitude'];
        if (!isNullOrUndefined(latitude) && !isNullOrUndefined(longitude)) { // Verifica se dentro da chave geo_location contém latitude e longitude
          products_with_geo_location.push(product); // Adiciona os produtos com geo localização, na lista de produtos com geo localização
        }
      }
    });
    return products_with_geo_location;
  }
  //#endregion

  //#region Tratando empreendimento com localização privilegiada
  //A informação "localização privilegiada" deverá ser exibida apenas quando o empreendimento estiver dentro do bounding box:
  // MIN_LAT = -21.269
  // MIN_LNG = -47.857
  // MAX_LAT = -21.211
  // MAX_LNG = -47.780
  treatment_latitude_and_longitude(products: []): [] {
    const products_with_geo_location_privileged: [] = []; //Produtos com geo localização privilegiada

    const min_lat: number = -21.269;
    const max_lat: number = -21.211;

    const min_lng: number = -47.857;
    const max_lng: number = -47.780;
    products.forEach(product => { // Passando pela lista de produtos
      const geo_location = product['address']['geo_location'];
      if (!isNullOrUndefined(geo_location)) { // Aceita produtos que contém a chave de geo_location
        const latitude: number = product['address']['geo_location']['latitude'];
        const longitude: number = product['address']['geo_location']['longitude'];
        if (!isNullOrUndefined(latitude) && !isNullOrUndefined(longitude)) { // Verifica se dentro da chave geo_location contém latitude e longitude
          if (((min_lat < latitude && latitude < max_lat)) && ((min_lng < longitude && longitude < max_lng))) {
            product['address']['geo_location'] = "Localização privilegiada" as never;
            products_with_geo_location_privileged.push(product);
          }
          else {
            product['address']['geo_location'] = "" as never;
            products_with_geo_location_privileged.push(product);
          }
        }
        else {
          product['address']['geo_location'] = "" as never;
          products_with_geo_location_privileged.push(product);
        }
      }
      else {
        product['address']['geo_location'] = "" as never;
        products_with_geo_location_privileged.push(product);
      }
    });
    return products_with_geo_location_privileged;
  }
  //#endregion

  //#region Tratando áreas utilizáveis
  // Um empreendimento pode conter mais de um valor de área útil dos apartamentos (chave usable_areas), mas o mesmo deve ser desconsiderado da lista quando ao menos um dos valores for menor ou igual a 10.
  treatment_usable_areas(products: []): [] {
    const products_with_approved_usable_areas: [] = [];

    products.forEach((product) => { // Passa pela lista de produtos já filtrados com geo_location
      const usable_areas_is_arrya = isArray(product['units']['usable_areas']);
      if (usable_areas_is_arrya) { // Verifica se as áreas utilizáveis é uma lista ou não
        const usable_areas: [] = product['units']['usable_areas'];
        const approved_product = usable_areas.map((useful_area) => {
          let approved: boolean = true;

          if (useful_area <= 10) { // Verifica se a área útil contida no empreendimento é menor ou igual a 10
            approved = false;
          }
          return approved;
        });

        const contain_reproved_product = approved_product.includes(false); // Verifica se contém false na lista de áreas utilizáveis

        if (!contain_reproved_product) { // Se o produto for aprovado, adicionamos ele a lista de aprovados
          products_with_approved_usable_areas.push(product);
        }
      }
      else {
        const usable_areas_is_null_or_undefined = isNullOrUndefined(product['units']['usable_areas']);
        if (!usable_areas_is_null_or_undefined) {
          const value_usable_area = product['units']['usable_areas'];
          if (value_usable_area > 10) {
            const array_value_usable_area: [] = [];
            array_value_usable_area.push(value_usable_area);
            product['units']['usable_areas'] = array_value_usable_area as never;
            products_with_approved_usable_areas.push(product);
          }
        }
      }
    });
    return products_with_approved_usable_areas;
  }
  //#endregion

  //#region Tratando suítes
  // Não exibir o número de suítes (chave en_suites) caso não existam valores. Também não exibir apenas o valor que seja menor do que 1, isto é, quando [0, 1, 2] exibir apenas "1 e 2".
  treatment_in_suites(products: []): [] {
    const products_with_approved_en_suites: [] = [];

    products.forEach((product) => { // Passa pela lista de produtos já filtrados
      const en_suites_is_array = isArray(product['units']['en_suites']); // Verifica se as suites é um array
      if (en_suites_is_array) {
        const en_suites: [] = product['units']['en_suites'];
        if (en_suites.length > 0) {
          en_suites.map((en_suite) => {
            if (en_suite < 1) { // Verifica se a suíte contida no empreendimento é menor que 1
              var index_suite = en_suites.indexOf(en_suite); // Pega o index da suíte
              en_suites.splice(index_suite, 1);
            }
          });
        }
        products_with_approved_en_suites.push(product);
      }
      else {
        const en_suites_is_null_or_undefined = isNullOrUndefined(product['units']['en_suites']);
        if (!en_suites_is_null_or_undefined) {
          const value_en_suite = product['units']['en_suites'];
          if (value_en_suite < 1) {
            const array_value_en_suite: [] = [];
            product['units']['en_suites'] = array_value_en_suite as never;
            products_with_approved_en_suites.push(product);
          }
          else {
            const array_value_en_suite: [] = [];
            array_value_en_suite.push(value_en_suite);
            product['units']['en_suites'] = array_value_en_suite as never;
            products_with_approved_en_suites.push(product);
          }
        }
        else {
          const array_empty_en_suite: [] = [];
          product['units']['en_suites'] = array_empty_en_suite as never;
          products_with_approved_en_suites.push(product);
        }
      }
    });
    return products_with_approved_en_suites;
  }
  //#endregion
}

