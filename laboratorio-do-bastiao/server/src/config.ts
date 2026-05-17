export interface ConfiguracaoServidor {
  porta: number;
  hostMonitor: string;
  databaseUrl?: string;
  redisUrl?: string;
}

export function carregarConfiguracao(): ConfiguracaoServidor {
  return {
    porta: Number(process.env.PORT ?? 2567),
    hostMonitor: process.env.MONITOR_HOST ?? '0.0.0.0',
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
  };
}
