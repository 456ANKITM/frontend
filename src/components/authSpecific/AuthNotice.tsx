import { AlertCircle } from "lucide-react";

export default function AuthNotice({ message }: { message: string | null }) {
  return (
    <div role="alert" aria-live="assertive">
      {message && (
        <p className="mt-5 flex items-start gap-2.5 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm leading-snug text-black">
          <AlertCircle className="mt-px h-4.5 w-4.5 shrink-0" aria-hidden="true" />
          <span>{message}</span>
        </p>
      )}
    </div>
  );
}