import { ConfigObject } from '@nestjs/config/dist/types/config-object.type';

export function appConfig(): ConfigObject {
  return {
    port: 5000,
  };
}
