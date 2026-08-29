import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/** Legacy /app/harvyx entry → canonical locale app. */
export default function HarvyxAppEntryPage() {
  redirect('/en/harvyx');
}
