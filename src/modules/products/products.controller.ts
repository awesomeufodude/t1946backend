import { Controller } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products/v1')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
}
