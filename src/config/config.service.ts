import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();
dotenv.config();

export type TConfig = {
  POSTGRES_PASSWORD: string;
  POSTGRES_USER: string;
  POSTGRES_HOST: string;
  POSTGRES_DATABASE: string;
  POSTGRES_PORT: number;
};

class ConfigService {
  config: TConfig = {} as TConfig;

  constructor(private env: { [k: string]: string | undefined }) {}

  public async setup(keys: string[]) {
    this.ensureValues(keys);
    await this.retrieveSecrets();

    return this;
  }

  public async retrieveSecrets() {
    const [versions] = await client.listSecretVersions({
      parent: 'projects/928190670092/secrets/communicator-dev-users-service',
    });

    // name: 'projects/928190670092/secrets/communicator-dev-users-service',

    console.log(versions);

    const secret = await client.accessSecretVersion({
      name: versions[0].name,
    });
    const data = JSON.parse(secret[0].payload.data.toString()) as TConfig;

    this.config = data;
  }

  public getConfig() {
    return this.config;
  }

  private getValue(key: string, throwOnMissing = false): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
  }

  public getPort() {
    return this.getValue('PORT', true);
  }

  public isProduction() {
    const env = this.getValue('ENV', false);
    return env !== 'DEV';
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.config.POSTGRES_HOST,
      port: this.config.POSTGRES_PORT,
      username: this.config.POSTGRES_USER,
      password: this.config.POSTGRES_PASSWORD,
      database: this.config.POSTGRES_DATABASE,
      entities: ['dist/**/*.entity{.ts,.js}'],
      migrationsTableName: 'migration',
      migrations: ['src/migration/*.ts'],
      cli: {
        migrationsDir: 'src/migration',
      },
      ssl: false,
      synchronize: true,
    };
  }
}

const configService = new ConfigService(process.env);

export { configService };
