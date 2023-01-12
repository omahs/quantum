import { IsString } from 'class-validator';

export class TransactionConfirmerActionDto {
  @IsString()
  transactionId!: string;
}
