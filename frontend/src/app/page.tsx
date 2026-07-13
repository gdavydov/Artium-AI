import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'Georgia, serif' }}>
      <h1>Artium Gallery — Catalog</h1>
      <ul>
        <li><Link href="/museum">Museum</Link></li>
        <li><Link href="/collection">Collection</Link></li>
      </ul>
    </main>
  );
}
