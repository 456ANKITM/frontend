"use client";

import { useState } from "react";
import AccordionItem from "./AccordionItem";
import Reveal from "./Reveal";
import { FAQS } from "@/config/faqs";

export default function FAQ() {
  // Only one item open at a time; null means all closed
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section id="faq" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-semibold text-gray-700">
            FAQ
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            Can not find what you are looking for? Reach out through the contact form below.
          </p>
        </Reveal>

        {/* Accordion */}
        <Reveal delay={100} className="mt-12 rounded-2xl border border-gray-200 bg-white px-5 sm:px-7">
          {FAQS.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              id={String(index)}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => toggle(index)}
            />
          ))}
        </Reveal>
      </div>
    </section>
  );
}