import Link from 'next/link';
import { ReadMeSubNav } from '@/components/ReadMeSubNav';

export default function ReadMeOverviewPage() {
  return (
    <div className="page page-prose">
      <header className="page-header">
        <h1>ReadMe</h1>
        <p className="muted">
          Help center — glossary, app guides, and documentation index.
        </p>
        <ReadMeSubNav />
      </header>

      <div className="card-grid readme-overview-grid">
        <section className="card">
          <h3>Glossary</h3>
          <p className="muted small">
            PCCL, MoS, YoC, catalyst bands, and verdict vocabulary from{' '}
            <code>GLOSSARY.md</code>.
          </p>
          <Link href="/readme/glossary" className="btn-primary card-btn">
            Open Glossary →
          </Link>
        </section>

        <section className="card">
          <h3>Documentation</h3>
          <p className="muted small">
            Getting started, web app routes, Supabase setup, and analysis workflows —
            browsable by index with in-page table of contents.
          </p>
          <Link href="/readme/documentation" className="btn-primary card-btn">
            Browse docs →
          </Link>
        </section>

        <section className="card">
          <h3>Prompt Guidelines</h3>
          <p className="muted small">
            Copy-paste prompts Ask Agent understands — buy/add, PCCL, news, risk, morning runs.
          </p>
          <Link href="/chat/prompts" className="card-link">
            Open prompts →
          </Link>
        </section>
      </div>

      <section className="card wide readme-quick-ref">
        <h2>Quick reference</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Topic</th>
                <th>Where</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Glossary terms</td>
                <td>
                  <Link href="/readme/glossary">Glossary</Link>
                </td>
              </tr>
              <tr>
                <td>Install &amp; Supabase</td>
                <td>
                  <Link href="/readme/documentation/supabase-setup">Supabase setup</Link> ·{' '}
                  <Link href="/readme/documentation/web-mvp">Web MVP</Link>
                </td>
              </tr>
              <tr>
                <td>Buy / add workflow</td>
                <td>
                  <Link href="/readme/documentation/buy-decision-workflow">Buy decision workflow</Link>
                </td>
              </tr>
              <tr>
                <td>UI routes &amp; tabs</td>
                <td>
                  <Link href="/readme/documentation/ui-design">UI design</Link>
                </td>
              </tr>
              <tr>
                <td>Ask Agent vs Calculator</td>
                <td>
                  <Link href="/chat">Ask Agent</Link> = Q&amp;A ·{' '}
                  <Link href="/stock-calculator">Stock Calculator</Link> = PE/CAGR what-if
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
