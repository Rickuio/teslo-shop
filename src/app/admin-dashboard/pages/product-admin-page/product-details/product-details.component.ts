import { Component, inject, input, OnInit } from '@angular/core';
import { Product } from '@products/interfaces/product.interface';
import { ProductCarouselComponent } from "@products/components/product-carousel/product-carousel.component";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '@utils/form-utils';
import { FormErrorLabelComponent } from "@shared/components/form-error-label/form-error-label.component";

@Component({
  selector: 'product-details',
  imports: [ProductCarouselComponent, ReactiveFormsModule, FormErrorLabelComponent],
  templateUrl: './product-details.component.html',
})
export class ProductDetailsComponent implements OnInit{ 

  product = input.required<Product>();

  fb = inject(FormBuilder);

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

  onSubmit() {
    const isValid = this.productForm.valid;
    console.log(this.productForm.value, {isValid});
  }

}
