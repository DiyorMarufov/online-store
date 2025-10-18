import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { WalletCurrencies } from 'src/common/enum';

export class CreateWalletDto {
  @ApiProperty({ description: 'Wallet balance', example: 1000 })
  @IsNumber()
  @IsNotEmpty()
  balance: number;

  @ApiProperty({
    description: 'Currency of the wallet',
    enum: WalletCurrencies,
    default: WalletCurrencies.UZS,
  })
  @IsEnum(WalletCurrencies)
  @IsNotEmpty()
  currency: WalletCurrencies = WalletCurrencies.UZS;
}
