/** Cloudflare R2 artifact storage for recordings / transcripts. */
export function r2Configured() {
  return Boolean(
    process.env.R2_ENDPOINT &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      (process.env.R2_BUCKET || process.env.R2_BUCKET_NAME),
  )
}

export function artifactKey(meetingId: string, kind: 'recording' | 'transcript' | 'summary') {
  return `meet/${meetingId}/${kind}`
}

export async function putArtifactPlaceholder(meetingId: string, kind: string, bytes: Buffer) {
  if (!r2Configured()) {
    return { stored: false as const, url: `inline://${meetingId}/${kind}`, size: bytes.length }
  }
  // Wire @aws-sdk/client-s3 when deploying artifacts
  return { stored: false as const, url: `r2://pending/${meetingId}/${kind}`, size: bytes.length }
}
