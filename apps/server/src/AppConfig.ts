import * as Joi from 'joi';

export function appConfig() {
  return {
    blockchain: {
      ethereumRpcUrl: process.env.ETHEREUM_RPC_URL || 'localhost:8545',
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379, // default redis port
    },
  };
}

export type AppConfig = ReturnType<typeof appConfig>;

export const ENV_VALIDATION_SCHEMA = Joi.object({
  ETHEREUM_RPC_URL: Joi.string().ip(),
});
