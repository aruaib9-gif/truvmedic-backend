import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeading from "../shared/SectionHeading";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "Engr. Adebayo Ogunleye",
    role: "HSE Manager",
    company: "Major Oil & Gas Operator",
    content: "TRUV Medical has been instrumental in maintaining the health and safety of our offshore workforce. Their rapid deployment capabilities and 24/7 medical coverage have significantly reduced our incident response time.",
    rating: 5,
  },
  {
    name: "Dr. Funke Adeyemi",
    role: "Chief Medical Officer",
    company: "Leading Manufacturing Company",
    content: "The telemedicine platform and remote monitoring solutions from TRUV have transformed how we manage occupational health across our facilities. Truly innovative approach to industrial healthcare.",
    rating: 5,
  },
  {
    name: "Captain James Okafor",
    role: "Operations Director",
    company: "Offshore Construction Firm",
    content: "We've worked with several medical service providers, but TRUV Medical stands out for their professionalism, compliance standards, and the quality of their offshore medics. Highly recommended.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((c) => (c + 1) % testimonials.length);
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Testimonials"
          title="Trusted by Industry Leaders"
          description="Hear from the organizations we serve about the impact of our healthcare solutions."
        />

        <div className="mt-16 max-w-4xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="bg-card rounded-3xl border border-border p-8 md:p-12 relative"
            >
              <Quote className="absolute top-6 right-8 w-16 h-16 text-primary/5" />
              
              <div className="flex items-center gap-1 mb-6">
                {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <blockquote className="text-lg md:text-xl text-foreground leading-relaxed mb-8 font-medium">
                "{testimonials[current].content}"
              </blockquote>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-heading font-semibold text-foreground">
                    {testimonials[current].name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonials[current].role}, {testimonials[current].company}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={prev} className="rounded-full w-10 h-10">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={next} className="rounded-full w-10 h-10">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Pagination dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === current ? "bg-primary w-8" : "bg-border hover:bg-primary/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}