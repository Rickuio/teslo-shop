import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Product, ProductsResponse } from '@products/interfaces/product.interface';
import { count, delay, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.baseUrl;

interface ProductOptions {
    limit?: number;
    offset?: number;
    gender: string;
}

@Injectable({providedIn: 'root'})
export class ProductsService {

    private http = inject(HttpClient);
    private productsCache = new Map<string, ProductsResponse>();
    private productCache = new Map<string, Product>();

    getProducts(options: ProductOptions):Observable<ProductsResponse> {

        const {limit=9, offset=4, gender=''} = options;
        const key = `${limit}-${offset}-${gender}`; // 9-0-''
        //console.log(this.productsCache.entries());

        if (this.productsCache.has(key)) {
            return of(this.productsCache.get(key)!);
        }

        const url = `${baseUrl}/products`;
        //return this.http.get<ProductsResponse>(url)
        return this.http.get<ProductsResponse>(url, {
            params: {
                limit: limit,
                offset: offset,
                gender: gender
            }
        })
            .pipe(
                tap( resp => console.log(resp)),
                tap((resp) => this.productsCache.set(key, resp))
            );
    }

    getProductByIdSlug(idSlug: string): Observable<Product> {
        if (this.productCache.has(idSlug)) {
            return of(this.productCache.get(idSlug)!);
        }
        return this.http.get<Product>(`${baseUrl}/products/${idSlug}`)
        .pipe(
            delay(1000),
            tap((product) => this.productCache.set(idSlug, product))
        );
    }

    getProductById(id: string): Observable<Product> {
        //if (this.productCache.has(id)) return of(this.productCache.get(id)!);
        return this.http
        .get<Product>(`${baseUrl}/products/${id}`)
        .pipe(tap((product) => this.productCache.set(id, product)));
    }

}