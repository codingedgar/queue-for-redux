const DEFAULT_CONFIG: Config = {
  stateName: 'offline',
  throttle: 'PT1M',
  ttl: 'PT1D'
}

export default function getConfig(userConfig: UserConfig): Config {
  return { ...DEFAULT_CONFIG, ...userConfig }
}
