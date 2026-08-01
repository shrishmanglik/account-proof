import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AccountProof — Evidence-bound account reliability",
  description: "A deterministic account reliability workspace for security-critical SaaS technical account teams.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
