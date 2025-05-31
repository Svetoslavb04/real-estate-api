export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface AppConfig {
  port: number;
  environment: string;
}

export interface Config {
  database: DatabaseConfig;
  jwt: JwtConfig;
  app: AppConfig;
}
