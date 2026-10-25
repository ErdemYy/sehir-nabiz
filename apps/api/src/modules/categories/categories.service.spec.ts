import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CategoriesService } from './categories.service';
import { CategoryEntity } from '../../database/entities/category.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let mockCategoryRepo: Partial<Record<keyof Repository<CategoryEntity>, ReturnType<typeof vi.fn>>>;

  const mockCategory: CategoryEntity = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    code: 'TRAFFIC',
    nameTr: 'Trafik Yoğunluğu',
    descriptionTr: 'Aşırı araç yoğunluğu',
    icon: 'traffic-cone',
    colorHex: '#EA580C',
    defaultDurationHours: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockCategoryRepo = {
      find: vi.fn(),
      findOne: vi.fn(),
    };
    service = new CategoriesService(mockCategoryRepo as any);
  });

  it('aktif kategorileri başarıyla listelemeli ve DTO formatına dönüştürmeli', async () => {
    mockCategoryRepo.find!.mockResolvedValue([mockCategory]);

    const result = await service.findAll();

    expect(result).toHaveLength(1);
    expect(result[0]?.code).toBe('TRAFFIC');
    expect(result[0]?.nameTr).toBe('Trafik Yoğunluğu');
    expect(result[0]?.colorHex).toBe('#EA580C');
    expect(mockCategoryRepo.find).toHaveBeenCalledWith({
      where: { isActive: true },
      order: { nameTr: 'ASC' },
    });
  });

  it('var olan bir kategoriyi ID ile getirebilmeli', async () => {
    mockCategoryRepo.findOne!.mockResolvedValue(mockCategory);

    const result = await service.findById(mockCategory.id);

    expect(result).toBeDefined();
    expect(result.id).toBe(mockCategory.id);
  });

  it('bulunamayan kategori ID sorgusunda NotFoundException fırlatmalı', async () => {
    mockCategoryRepo.findOne!.mockResolvedValue(null);

    await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
  });
});
