import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { PracticeAreas } from "@/components/practice-areas";
import { Services } from "@/components/services";
import { Newsletter } from "@/components/newsletter";
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
      <Newsletter />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
