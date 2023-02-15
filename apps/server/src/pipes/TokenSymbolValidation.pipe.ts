import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { TokenSymbol } from '@prisma/client';
import { isDefined, isEnum } from 'class-validator';

@Injectable()
export class TokenSymbolValidationPipe implements PipeTransform<TokenSymbol> {
  async transform(symbol: TokenSymbol): Promise<TokenSymbol> {
    if (isDefined(symbol) && isEnum(symbol, TokenSymbol)) {
      return TokenSymbol[symbol];
    }
    const errorMessage = `Symbol '${symbol}' is not valid. See the acceptable values: ${Object.keys(TokenSymbol).map(
      (key) => (TokenSymbol as any)[key],
    )}`;
    throw new BadRequestException(errorMessage);
  }
}
