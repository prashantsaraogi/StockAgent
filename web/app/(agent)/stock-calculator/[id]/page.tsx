import { notFound, redirect } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

/** Legacy detail URLs: /stock-calculator/{uuid} → /stock-calculator/cagr/{uuid} */
export default async function LegacyCalculatorDetailRedirect({ params }: Props) {
  const { id } = await params;
  if (id === 'cagr' || id === 'pe') notFound();
  if (/^[0-9a-f-]{36}$/i.test(id)) {
    redirect(`/stock-calculator/cagr/${id}`);
  }
  notFound();
}
