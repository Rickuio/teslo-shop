import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Product, ProductsResponse } from '@products/interfaces/product.interface';
import { Observable, tap } from 'rxjs';
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

    getProducts(options: ProductOptions):Observable<ProductsResponse> {

        const {limit=9, offset=0, gender=''} = options;

        const url = `${baseUrl}/products`;
        return this.http.get<ProductsResponse>(url, {
            params: {
                limit: limit,
                offset: offset,
                gender: gender
            }
        })
            .pipe(
                tap( resp => console.log(resp))
            );
    }

    getProductByIdSlug(idSlug: string): Observable<Product> {
        return this.http.get<Product>(`${baseUrl}/products/${idSlug}`);
    }

}