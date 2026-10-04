import { Clock, Mail, MessageCircle } from "lucide-react";
import ContactForm from "./ContactForm";
import Reveal from "@/components/HomePageSpecific/Reveal";

export default function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-20 bg-gray-50 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
          {/* Info column */}
          <Reveal>
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700">
              Contact
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-black sm:text-4xl">
              Request a demo or ask us anything
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
              Tell us a bit about your business and we will get back to you with a walkthrough tailored
              to your stores.
            </p>

            <ul className="mt-8 space-y-4">
              <li className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Email us</p>
                  <p className="text-sm text-gray-600">hello@erpsuite.com</p>
                </div>
              </li>
              <li className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Response time</p>
                  <p className="text-sm text-gray-600">Within one business day</p>
                </div>
              </li>
              <li className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Prefer to talk?</p>
                  <p className="text-sm text-gray-600">We will include a call time in our reply</p>
                </div>
              </li>
            </ul>
          </Reveal>

          {/* Form card */}
          <Reveal delay={150}>
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}