import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '@auth/interfaces/user.interface';
import { Gender, Product, ProductsResponse } from '@products/interfaces/product.interface';
import { count, delay, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.baseUrl;

interface ProductOptions {
    limit?: number;
    offset?: number;
    gender: string;
}

const emptyProduct: Product = {
    id: 'new',
    title: '',
    price: 0,
    description: '',
    slug: '',
    stock: 0,
    sizes: [],
    gender: Gender.Men,
    tags: [],
    images: [],
    user: {} as User,
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
        if (id == 'new') {
            return of(emptyProduct);
        }
        //if (this.productCache.has(id)) return of(this.productCache.get(id)!);
        return this.http
        .get<Product>(`${baseUrl}/products/${id}`)
        .pipe(tap((product) => this.productCache.set(id, product)));
    }

    createProduct(productLike: Partial<Product>, imageFilelist?: FileList): Observable<Product> {
        const url = `${baseUrl}/products`;
        return this.http.post<Product>(url, productLike).pipe(
            tap( (product) => this.updateProductCache(product, true) )
        );
        //TODO: Modificar el metodo para crear productos con imagenes
    }

    updateProduct(id: string, productLike: Partial<Product>, imageFilelist?: FileList): Observable<Product> {
        //console.log('Concatenacion de observables');
        const currenImages = productLike.images ?? [];
        const url = `${baseUrl}/products/${id}`;
        return this.uploadImages(imageFilelist).pipe(
            map(imagesNames => ({
                ...productLike, images: [...currenImages, ...imagesNames]
            })),
            switchMap( (updatedProduct) => this.http.patch<Product>(url, updatedProduct)),
            tap( (product) => this.updateProductCache(product, false) )
        )
        // return this.http.patch<Product>(url, productLike).pipe(
        //     tap( (product) => this.updateProductCache(product, false) )
        // );
    }

    updateProductCache(product: Product, isNew: boolean) {
        const prodId = product.id;
        this.productCache.set(prodId, product);
        if (!isNew){
            this.productsCache.forEach(prodResponse => {
                prodResponse.products = prodResponse.products.map(
                    (currentProd) => {
                        return currentProd.id == prodId ? product : currentProd;
                    }
                );
            });
        }
        console.log('Cache actualizado!')
    }

    // Tomar un FileList y subir
    uploadImages(images?: FileList): Observable<string[]> {
        if (!images) return of([]);
        const uploadObservables = Array.from(images).map(imageFile => this.uploadImage(imageFile));
        return forkJoin(uploadObservables).pipe(
            tap( (imageNames) => console.log({imageNames}))
        );
    }

    uploadImage(imageFile: File): Observable<string> {
        const url = `${baseUrl}/files/product`;
        const formData = new FormData();
        formData.append('file', imageFile);
        return this.http.post<{fileName: string}>(url, formData).pipe(
            map( resp => resp.fileName)
        )

    }

}