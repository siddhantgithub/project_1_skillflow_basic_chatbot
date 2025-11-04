import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "SkillFlow-AI Client - Support Assistant",
  description:
    "Get instant answers about SkillFlow-AI Client products, services, pricing, and policies. Our AI-powered support assistant is here to help 24/7.",
  openGraph: {
    title: "SkillFlow-AI Client - Support Assistant",
    description: "Get instant answers about SkillFlow-AI Client products, services, pricing, and policies.",
    images: [
      {
        url: "/og?title=SkillFlow-AI Client&description=AI-Powered Support Assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillFlow-AI Client - Support Assistant",
    description: "Get instant answers about SkillFlow-AI Client products, services, pricing, and policies.",
    images: [
      {
        url: "/og?title=SkillFlow-AI Client&description=AI-Powered Support Assistant",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/skillflow-icon.svg" type="image/svg+xml" />
      </head>
      <body className={cn(GeistSans.className, "antialiased dark flex flex-col min-h-screen")}>
        <Toaster position="top-center" richColors />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
