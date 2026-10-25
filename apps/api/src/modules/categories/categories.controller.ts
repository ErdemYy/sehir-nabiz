import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoryDto } from '@sehir-nabiz/shared';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getCategories(): Promise<CategoryDto[]> {
    return this.categoriesService.findAll();
  }
}
