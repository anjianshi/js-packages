interface InjectVars {
  APP_CONFIG: {
    inDev: boolean
  }
}
export const config = (window as unknown as InjectVars).APP_CONFIG
