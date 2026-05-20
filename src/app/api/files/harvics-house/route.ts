import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'archive', 'files', 'Harvics_House.pdf')
    const fileBuffer = await fs.readFile(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="Harvics_House.pdf"',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'File not found', detail: error instanceof Error ? error.message : 'Unknown error' },
      { status: 404 }
    )
  }
}
