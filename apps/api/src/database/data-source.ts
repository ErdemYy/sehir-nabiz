import { DataSource, DataSourceOptions } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { CategoryEntity } from './entities/category.entity';
import { EventEntity } from './entities/event.entity';
import { EventModerationLogEntity } from './entities/event-moderation-log.entity';
import { EventMediaEntity } from './entities/event-media.entity';
import { EventFeedbackEntity } from './entities/event-feedback.entity';
import { UserReputationLogEntity } from './entities/user-reputation-log.entity';
import { InitialAuthAndPostGis1740000000000 } from './migrations/1740000000000-InitialAuthAndPostGis';
import { CreateCategoriesAndEvents1740000001000 } from './migrations/1740000001000-CreateCategoriesAndEvents';
import { CreateEventMedia1740000002000 } from './migrations/1740000002000-CreateEventMedia';
import { CreateEventFeedbackAndReputationLogs1740000003000 } from './migrations/1740000003000-CreateEventFeedbackAndReputationLogs';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5434', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres_secure_dev_password',
  database: process.env.DB_DATABASE || 'sehir_nabiz',
  entities: [
    UserEntity,
    RefreshTokenEntity,
    CategoryEntity,
    EventEntity,
    EventModerationLogEntity,
    EventMediaEntity,
    EventFeedbackEntity,
    UserReputationLogEntity,
  ],
  migrations: [
    InitialAuthAndPostGis1740000000000,
    CreateCategoriesAndEvents1740000001000,
    CreateEventMedia1740000002000,
    CreateEventFeedbackAndReputationLogs1740000003000,
  ],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
