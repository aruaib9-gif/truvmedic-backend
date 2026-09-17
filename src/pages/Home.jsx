import React from "react";
import HeroSection from "../components/home/HeroSection";
import TrustIndicators from "../components/home/TrustIndicators";
import ServicesOverview from "../components/home/ServicesOverview";
import WhyChooseUs from "../components/home/WhyChooseUs";
import IndustriesSection from "../components/home/IndustriesSection";
import DigitalHealthShowcase from "../components/home/DigitalHealthShowcase";
import TestimonialsSection from "../components/home/TestimonialsSection";
import CTASection from "../components/home/CTASection";
import NewsletterSection from "../components/shared/NewsletterSection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <TrustIndicators />
      <ServicesOverview />
      <WhyChooseUs />
      <IndustriesSection />
      <DigitalHealthShowcase />
      <TestimonialsSection />
      <NewsletterSection />
      <CTASection />
    </div>
  );
}