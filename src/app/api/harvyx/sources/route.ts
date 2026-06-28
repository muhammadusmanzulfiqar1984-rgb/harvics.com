import { NextResponse } from 'next/server';
import sourcesData from '@/data/harvyx/source-library.json';

export async function GET() {
  return NextResponse.json(sourcesData);
}
