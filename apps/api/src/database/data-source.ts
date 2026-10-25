import { DataSource, DataSourceOptions } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { InitialAuthAndPostGis1740000000000 } from './migrations/1740000000000-InitialAuthAndPostGis';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres_secure_dev_password',
  database: process.env.DB_DATABASE || 'sehir_nabiz',
  entities: [UserEntity, RefreshTokenEntity],
  migrations: [InitialAuthAndPostGis1740000000000],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
