import { redirect } from 'next/navigation';

/** Legacy route — Glossary moved under ReadMe */
export default function GlossaryRedirectPage() {
  redirect('/readme/glossary');
}
