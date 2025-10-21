import { index } from './meili.search';

export async function initMeiliIndex() {
  await index.updateFilterableAttributes([
    'category_id',
    'attribute_id',
    'attribute_value_id',
  ]);

  await index.updateSortableAttributes([
    'price',
    'average_rating',
    'created_at',
  ]);

  console.log('MeiliSearch index initialized!');
}

