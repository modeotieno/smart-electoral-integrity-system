import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import AboutPreview from "../../components/AboutPreview/AboutPreview";
import Features from "../../components/Features/Features";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import WhoWeServe from "../../components/WhoWeServe/WhoWeServe";
import DashboardPreview from "../../components/DashboardPreview/DashboardPreview";
import ContactPreview from "../../components/ContactPreview/ContactPreview";

function Home() {
  return (
    <>
      <Navbar />

      <Hero />

      <AboutPreview />

      <Features />

      <HowItWorks />

      <WhoWeServe />

      <DashboardPreview />
      <ContactPreview />
    </>
  );
}

export default Home;