import { PASSWORD_MIN_LENGTH } from "@/config/businessDefaults";

const LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"];

function getScore(pw: string) {
  return [
    pw.length >= PASSWORD_MIN_LENGTH,
    /[a-z]/.test(pw) && /[A-Z]/.test(pw),
    /\d/.test(pw),
    /[^A-Za-z0-9]/.test(pw),
  ].filter(Boolean).length;
}

export default function PasswordStrengthIndicator({ password }: { password: string }) {
  if (!password) {
    return (
      <p className="mt-2 text-xs text-gray-500">
        Use at least {PASSWORD_MIN_LENGTH} characters with letters and numbers.
      </p>
    );
  }

  const score = getScore(password);

  return (
    <div className="mt-2">
      <div className="flex gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={`h-1 flex-1 rounded-full transition-colors ${
              n <= score ? "bg-black" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-gray-600" aria-live="polite">
        Password strength: <span className="font-medium text-black">{LABELS[score]}</span>
      </p>
    </div>
  );
}