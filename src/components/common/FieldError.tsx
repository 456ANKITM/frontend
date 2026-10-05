import { CircleAlert } from "lucide-react";

type Props = { id: string; message?: string };

export default function FieldError({ id, message }: Props) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-sm text-[#B42318]">
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}