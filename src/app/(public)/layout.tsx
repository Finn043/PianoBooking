import { ReactNode } from "react";
import Script from "next/script";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Script
        src="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Cabin:wght@400;500;600;700&family=Instrument+Serif:ital,wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap"
        strategy="beforeInteractive"
      />
      <div className="min-h-screen bg-surface-100">
        {children}
      </div>
    </>
  );
}
