export type databaseConfig = {
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  entities: string[];
  autoLoadEntities: boolean;
  synchronize: boolean;
};
