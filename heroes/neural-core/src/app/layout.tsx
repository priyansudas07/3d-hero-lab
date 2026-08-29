import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://synapse.studio";

export const viewport: Viewport = {
  themeColor: "#030308",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SYNAPSE LAB // Experimental Software & 3D Systems",
    template: "%s — SYNAPSE LAB",
  },
  description:
    "Experimental laboratory and technical portfolio specializing in real-time WebGL graphics, 3D spatial simulations, distributed event pipelines, and graph-coupled interfaces.",
  keywords: [
    "WebGL",
    "Three.js",
    "3D Hero",
    "Computer Science",
    "GLSL",
    "Software Engineering",
    "Graph Simulation",
    "React Three Fiber",
  ],
  authors: [{ name: "Priyansu Das", url: siteUrl }],
  creator: "Priyansu Das",
  publisher: "SYNAPSE LAB",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "SYNAPSE LAB // Experimental Software & 3D Systems",
    description:
      "Real-time WebGL graphics, 3D spatial simulations, and high-performance graph systems engineered from fundamental principles.",
    siteName: "SYNAPSE LAB",
  },
  twitter: {
    card: "summary_large_image",
    title: "SYNAPSE LAB // Experimental Software & 3D Systems",
    description:
      "Real-time WebGL graphics, 3D spatial simulations, and high-performance graph systems engineered from fundamental principles.",
  },
};

import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Priyansu Das",
    alternateName: "SYNAPSE LAB",
    url: siteUrl,
    jobTitle: "Computer Science & Engineering Student / Software Engineer",
    sameAs: ["https://github.com/priyansudas07"],
    knowsAbout: [
      "WebGL",
      "Three.js",
      "Computer Science",
      "Distributed Systems",
      "GLSL Shaders",
      "Algorithms",
    ],
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#030308] text-[#E2E8F0]">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
