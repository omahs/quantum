import { IsEnum, IsOptional } from 'class-validator';

export enum SupportedNetwork {
  mainnet = 'mainnet',
  testnet = 'testnet',
  regtest = 'regtest',
  devnet = 'devnet',
  local = 'local',
}
export class NetworkDto {
  @IsOptional()
  @IsEnum(SupportedNetwork)
  network: SupportedNetwork | undefined;
}
