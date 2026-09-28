import Link from "next/link";
import { ArrowRight, PackagePlus, Rocket, Store, UserPlus } from "lucide-react";
import Reveal from "./Reveal";
import StepItem from "@/components/HomePageSpecific/Stepitem";
import type { StepItemProps } from "@/components/HomePageSpecific/Stepitem";

type StepData = Pick<StepItemProps, "title" | "description" | "icon">;

const STEPS: StepData[] = [
  {
    icon: UserPlus,
    title: "Register your business",
    description: "Sign up as the Owner with your business and personal details to create your account.",
  },
  {
    icon: Store,
    title: "Add your stores and invite Store Managers",
    description: "Create each store, then invite Store Managers by email and assign them to a location.",
  },
  {
    icon: PackagePlus,
    title: "Add products and record purchases",
    description:
      "Build your product catalog and record stock coming from suppliers so inventory is ready to sell.",
  },
  {
    icon: Rocket,
    title: "Start selling and track reports",
    description:
      "Bill customers at the POS and follow sales, stock and profit across every store from your dashboard.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-semibold text-gray-700">
            How it works
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Up and running in four simple steps
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            Bring your whole business into one system by following these steps.
          </p>
        </Reveal>

        {/* Timeline: vertical on mobile, horizontal on desktop */}
        <ol className="relative mx-auto mt-14 max-w-md lg:mt-16 lg:grid lg:max-w-none lg:grid-cols-4 lg:gap-8">
          {/* Horizontal connector (desktop only), runs through the circle centers */}
          <span
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-0 -translate-y-1/2 border-t-2 border-dashed border-gray-300 lg:block"
          />

          {STEPS.map((step, index) => {
            const isLast = index === STEPS.length - 1;
            return (
              <StepItem
                key={step.title}
                number={index + 1}
                icon={step.icon}
                title={step.title}
                description={step.description}
                isLast={isLast}
                delay={index * 120}
              >
                {isLast && (
                  <Link
                    href="/register"
                    className="group mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-black px-6 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-all duration-200 hover:bg-gray-800 hover:shadow-xl"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                )}
              </StepItem>
            );
          })}
        </ol>
      </div>
    </section>
  );
}