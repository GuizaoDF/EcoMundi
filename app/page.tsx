import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { PracticeAreas } from "@/components/practice-areas";
import { Services } from "@/components/services";
import { Profissionais } from "@/components/profissionais";
import { Newsletter } from "@/components/newsletter";
import { Clientes } from "@/components/clientes";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { WhatsAppButton } from "@/components/whatsapp-button";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <About />
      <PracticeAreas />
      <Services />
      <Profissionais />
      <Newsletter />
      <Clientes />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
