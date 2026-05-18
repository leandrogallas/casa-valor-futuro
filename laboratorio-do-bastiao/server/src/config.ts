export interface ConfiguracaoServidor {
  porta: number;
  hostMonitor: string;
  sqlitePath: string;
  jwtSecret: string;
}

export function carregarConfiguracao(): ConfiguracaoServidor {
  return {
    porta: Number(process.env.PORT ?? 2567),
    hostMonitor: process.env.MONITOR_HOST ?? '0.0.0.0',
    sqlitePath: process.env.SQLITE_PATH ?? './data/bastiao.db',
    jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
  };
}
