import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../../database/entities/category.entity';
import { CategoryDto } from '@sehir-nabiz/shared';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  /**
   * Tüm aktif kategorileri listele
   */
  async findAll(): Promise<CategoryDto[]> {
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      order: { nameTr: 'ASC' },
    });

    return categories.map(cat => this.toDto(cat));
  }

  /**
   * Kategori ID ile tekil kategori getir
   */
  async findById(id: string): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOne({
      where: { id, isActive: true },
    });

    if (!category) {
      throw new NotFoundException('Belirtilen kategori bulunamadı veya pasif durumda.');
    }

    return category;
  }

  /**
   * Kategori Kodu ile kategori getir
   */
  async findByCode(code: string): Promise<CategoryEntity | null> {
    return this.categoryRepository.findOne({
      where: { code, isActive: true },
    });
  }

  /**
   * Entity'den ortak CategoryDto'ya dönüştürücü
   */
  toDto(cat: CategoryEntity): CategoryDto {
    return {
      id: cat.id,
      code: cat.code,
      nameTr: cat.nameTr,
      descriptionTr: cat.descriptionTr,
      icon: cat.icon,
      colorHex: cat.colorHex,
      defaultDurationHours: cat.defaultDurationHours,
      isActive: cat.isActive,
    };
  }
}
