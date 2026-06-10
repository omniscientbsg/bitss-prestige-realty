import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-heading"
});

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans" 
});

export const metadata = {
  title: "BITSS Prestige Realty | Exclusive Luxury Investments",
  description: "Redefining luxury investments in Dubai. Exclusive access to off-plan pre-launches, distress deals, and high-yield properties curated for elite investors.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={cn(
        "min-h-screen bg-background text-foreground font-sans antialiased",
        cormorant.variable, 
        dmSans.variable
      )}>
        {children}
      </body>
    </html>
  );
}
