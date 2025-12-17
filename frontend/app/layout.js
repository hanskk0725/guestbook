import "./globals.css";

export const metadata = {
  title: "Guestbook",
  description: "Simple guestbook application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}