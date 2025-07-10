import { Component, inject } from '@angular/core';
import { ProductCardComponent } from '@products/components/product-card/product-card.component';
import { ProductsService } from '@products/services/products.service';
//import { ProductCardComponent } from "../../../products/components/product-card/product-card.component";
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home-page',
  imports: [ProductCardComponent],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent { 

  private productsService = inject(ProductsService);
  productsResource = rxResource({
    request: () => ({}),
    loader: ({ request }) => {
      console.log(request);
      return this.productsService.getProducts({ gender: 'women' });
    }  
  });

}
