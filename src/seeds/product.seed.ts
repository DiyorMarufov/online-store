import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { CategoriesEntity } from 'src/core/entity/categories.entity';
import { ProductsEntity } from 'src/core/entity/products.entity';
import { Status } from 'src/common/enum';
import { Repository } from 'typeorm';
import { index } from 'src/infrastructure/meili-search/meili.search';

@Injectable()
export class ProductSeeder implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(ProductsEntity)
    private readonly productRepo: Repository<ProductsEntity>,
    @InjectRepository(CategoriesEntity)
    private readonly categoryRepo: Repository<CategoriesEntity>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.productRepo.count();

    if (!count) {
      const category = await this.categoryRepo.findOne({
        where: { id: 1 },
      });

      if (!category) {
        console.log('❌ Category not found, seeding skipped.');
        return;
      }

      const products: ProductsEntity[] = [];

      for (let i = 0; i < 10000; i++) {
        const product = this.productRepo.create({
          category,
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          image: faker.image.urlPicsumPhotos({ width: 500, height: 500 }),
          is_active: faker.helpers.arrayElement([
            Status.ACTIVE,
            Status.INACTIVE,
          ]),
          average_rating: parseFloat(
            faker.number.float({ min: 0, max: 5 }).toFixed(1),
          ),
        });
        products.push(product);
      }

      await this.productRepo.save(products);
      const productsRelation = await this.productRepo.find({
        relations: [
          'category',
          'product_variants',
          'product_variants.product_variant_attributes',
          'product_variants.product_variant_attributes.product_attribute',
          'product_variants.product_variant_attributes.product_attribute.product_attribute_values',
        ],
      });

      const productsForMeili = productsRelation.map((p) => {
        const attributeIds =
          p.product_variants?.flatMap((v) =>
            v.product_variant_attributes?.map(
              (attr) => attr.product_attribute.id,
            ),
          ) ?? [];

        const attributeValueIds =
          p.product_variants?.flatMap((v) =>
            v.product_variant_attributes?.flatMap((attr) =>
              attr.product_attribute.product_attribute_values?.map(
                (val) => val.id,
              ),
            ),
          ) ?? [];

        return {
          id: p.id,
          name: p.name,
          description: p.description,
          image: p.image,
          is_active: p.is_active,
          average_rating: p.average_rating,
          category_id: p.category.id,
          attribute_id: attributeIds,
          attribute_value_id: attributeValueIds,
          created_at: p.created_at,
        };
      });

      await index.addDocuments(productsForMeili);

      console.log('✅ Products seeded successfully!');
    }
  }
}
