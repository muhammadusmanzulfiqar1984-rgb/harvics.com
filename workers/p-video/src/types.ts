export interface Env {
  // Secrets
  REPLICATE_API_KEY?: string
  /** @deprecated prefer REPLICATE_API_KEY */
  REPLICATE_API_TOKEN?: string
  PRUNA_API_KEY?: string
  CF_AIG_TOKEN?: string

  // Vars
  CLOUDFLARE_ACCOUNT_ID?: string
  AI_GATEWAY_ID?: string

  // Workers AI binding
  AI: Ai

  // R2 bucket
  ASSETS_BUCKET?: R2Bucket

  // KV (optional)
  CACHE?: KVNamespace
}
