import { NextResponse } from 'next/server';
import leadsData from '@/data/harvyx/leads.json';

export async function GET() {
  return NextResponse.json(leadsData);
}
