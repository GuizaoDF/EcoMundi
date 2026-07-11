import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Diagnóstico Preliminar | ECO MUNDI",
  description:
    "Avalie gratuitamente o nível de conformidade regulatória e sustentabilidade corporativa da sua empresa.",
};

export default function DiagnosticoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
