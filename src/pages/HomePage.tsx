import Header from "../components/Header";
import Hero from "../components/Hero";
import SignatureBouquet from "../components/SignatureBouquet";
import Customizer from "../components/customizer/Customizer";
import Packages from "../components/Packages";
import Policies from "../components/Policies";
import Footer from "../components/Footer";
import WhatsAppFab from "../components/WhatsAppFab";
import StickyBar from "../components/StickyBar";

export default function HomePage() {
  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Header />
      <main>
        <Hero />
        <SignatureBouquet />
        <Customizer />
        <Packages />
        <Policies />
      </main>
      <Footer />
      <WhatsAppFab />
      <StickyBar />
    </div>
  );
}
