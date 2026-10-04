import { Plus } from "lucide-react";

interface AccordionItemProps {
  id: string;
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function AccordionItem({ id, question, answer, isOpen, onToggle }: AccordionItemProps) {
  const buttonId = `faq-button-${id}`;
  const panelId = `faq-panel-${id}`;

  return (
    <div className="border-b border-gray-200 py-2 first:pt-0 last:border-b-0 last:pb-0">
      <h3>
        <button
          id={buttonId}
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-4 py-4 text-left"
        >
          <span
            className={`text-base font-semibold transition-colors duration-200 sm:text-lg ${
              isOpen ? "text-black" : "text-gray-900"
            }`}
          >
            {question}
          </span>
          <span
            aria-hidden="true"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
              isOpen
                ? "rotate-45 border-black bg-black text-white"
                : "border-gray-300 bg-white text-gray-600"
            }`}
          >
            <Plus className="h-4 w-4" />
          </span>
        </button>
      </h3>

      {/* Height animates via the grid-template-rows 0fr -> 1fr trick: no JS measuring needed */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="pb-5 pr-10 text-sm leading-relaxed text-gray-600 sm:text-base">{answer}</p>
        </div>
      </div>
    </div>
  );
}