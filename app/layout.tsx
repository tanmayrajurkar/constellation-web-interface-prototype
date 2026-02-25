import type { Metadata } from "next";
import { GlobalProvider } from "@/context/GlobalContext";
import { SatelliteProvider } from "@/context/SatelliteContext";
import { LogProvider } from "@/context/LogContext";
import { GlobalHeader } from "@/components/shared/GlobalHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Constellation Mission Control",
  description: "Web interface prototype for control and observatory",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SatelliteProvider>
          <GlobalProvider>
            <LogProvider>
              <GlobalHeader />
              <main>{children}</main>
            </LogProvider>
          </GlobalProvider>
        </SatelliteProvider>
      </body>
    </html>
  );
}
