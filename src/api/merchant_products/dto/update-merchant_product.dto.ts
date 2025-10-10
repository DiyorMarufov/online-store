import { PartialType } from '@nestjs/mapped-types';
import { CreateMerchantProductDto } from './create-merchant_product.dto';

export class UpdateMerchantProductDto extends PartialType(CreateMerchantProductDto) {}
