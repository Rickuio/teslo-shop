import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Product } from '@products/interfaces/product.interface';
import { ProductCarouselComponent } from "@products/components/product-carousel/product-carousel.component";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '@utils/form-utils';
import { FormErrorLabelComponent } from "@shared/components/form-error-label/form-error-label.component";
import { ProductsService } from '@products/services/products.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'product-details',
  imports: [ProductCarouselComponent, ReactiveFormsModule, FormErrorLabelComponent],
  templateUrl: './product-details.component.html',
})
export class ProductDetailsComponent implements OnInit{ 

  product = input.required<Product>();
  
  fb = inject(FormBuilder);
  productService = inject(ProductsService);
  router = inject(Router);
  isUpdate = signal(false);

  imageFileList: FileList | undefined = undefined;
  tempImages = signal<string[]>([]);

  imagesToCarousel = computed( () => {
    const totalImages = [ ...this.product().images, ...this.tempImages()];
    return totalImages;
  });

  productForm = this.fb.group({
    title: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(FormUtils.slugPattern)]],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    tags: [''],
    sizes: [['']],
    images: [[]],
    gender: ['men', [Validators.required, Validators.pattern(/men|women|kid|unisex/)]],
  });

  sizes = ['XS','S','M','L','XL','XXL'];

  ngOnInit(): void {
    this.setFormValue(this.product());
  }

  setFormValue( formTemplate: Partial<Product>) {
    this.productForm.reset(this.product() as any);
    //this.productForm.patchValue(formTemplate as any);
    this.productForm.patchValue({ tags: formTemplate.tags?.join(', ')});
  }

  onSizeClicked( size: string ) {
    const currentSizes = this.productForm.value.sizes ?? [];
    if (currentSizes.includes(size)) {
      currentSizes.splice(currentSizes.indexOf(size), 1);
    }else {
      currentSizes.push(size);
    }
    this.productForm.patchValue({ sizes: currentSizes });
  }

  async onSubmit() {
    
    const isValid = this.productForm.valid;
    //console.log(this.productForm.value, {isValid});
    this.productForm.markAllAsTouched();
    
    if (!isValid) return;
    const formValue = this.productForm.value;

    const productLike: Partial<Product> = {
      ...(formValue as any),
      tags: formValue.tags?.toLowerCase().split(',').map((tag) => tag.trim()) ?? [],

    };

    if (this.product().id == 'new') {
      /*
      this.productService.createProduct(productLike).subscribe(
        (product) => {
          console.log('Producto Creado!');
          this.router.navigate(['/admin/products', product.id]);
          }
          );
      */
      const product = await firstValueFrom(
        this.productService.createProduct(productLike, this.imageFileList)
      );
      this.router.navigate(['/admin/products', product.id]);
          
    }else {
      /*
      this.productService.updateProduct(this.product().id, productLike).subscribe({
        next: (data) => console.log('Producto actualizado!')
      });
      */
      await firstValueFrom(
        this.productService.updateProduct(this.product().id, productLike, this.imageFileList)
      );
    }

    this.isUpdate.set(true);
    setTimeout(()=>{
      this.isUpdate.set(false);
    }, 2000);

  }

  // Images
  onFileChanged( event: Event) {
    const fileList = ( event.target as HTMLInputElement).files;
    this.imageFileList = fileList ?? undefined;
    this.tempImages.set([]);
    const imgUrls = Array.from(fileList ?? []).map( 
      (file) => URL.createObjectURL(file)
    );
    console.log({Urls: imgUrls});
    this.tempImages.set(imgUrls);
  }

}
