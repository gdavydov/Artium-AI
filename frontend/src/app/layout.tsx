import { AuthProvider } from '@/lib/auth-context';

export const metadata = {
  title: 'Artium Gallery',
  description: 'Museum catalog — dynamic collection browser',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
