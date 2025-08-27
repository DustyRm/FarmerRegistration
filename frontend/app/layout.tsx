import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agri Registry',
  description: 'Cadastro de Agricultores',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
