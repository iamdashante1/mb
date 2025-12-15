import './globals.css';
import { Playfair_Display } from 'next/font/google';

const headingFont = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
});

export const metadata = {
  title: 'In Loving Memory of Michele Bailey',
  description: 'Celebrating the life of Michele Bailey with service details, tributes, RSVPs, and cherished memories.',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={headingFont.variable}>{children}</body>
    </html>
  );
}
