export const metadata = {
  title: 'Artium Gallery',
  description: 'Museum catalog — dynamic collection browser',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
