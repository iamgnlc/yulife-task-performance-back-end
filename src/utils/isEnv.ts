export const isEnv = (env: string | undefined): boolean =>
  [env].includes(process.env.NODE_ENV);
