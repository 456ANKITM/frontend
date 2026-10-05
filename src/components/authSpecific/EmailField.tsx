// "use client";

// import { forwardRef, type InputHTMLAttributes } from "react";
// import { Mail } from "lucide-react";
// import FieldError from "@/components/common/FieldError";
// import { fieldInput } from "@/components/common/inputStyles";

// type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "id"> & {
//   error?: string;
// };

// const EmailField = forwardRef<HTMLInputElement, Props>(function EmailField(
//   { error, ...rest },
//   ref,
// ) {
//   const id = "email";
//   const errorId = `${id}-error`;

//   return (
//     <div>
//       <label htmlFor={id} className="mb-2 block text-sm font-medium text-foreground">
//         Email address
//       </label>
//       <div className="relative">
//         <Mail
//           className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#8A93A6]"
//           aria-hidden="true"
//         />
//         <input
//           {...rest}
//           ref={ref}
//           id={id}
//           type="email"
//           autoComplete="email"
//           inputMode="email"
//           autoCapitalize="none"
//           spellCheck={false}
//           maxLength={254}
//           placeholder="you@company.com"
//           aria-invalid={error ? true : undefined}
//           aria-describedby={error ? errorId : undefined}
//           className={fieldInput(Boolean(error))}
//         />
//       </div>
//       <FieldError id={errorId} message={error} />
//     </div>
//   );
// });

// export default EmailField;

"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { Mail } from "lucide-react";
import FieldError from "@/components/common/FieldError";
import { fieldInput } from "@/components/common/inputStyles";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "id"> & {
  error?: string;
};

const EmailField = forwardRef<HTMLInputElement, Props>(function EmailField(
  { error, ...rest },
  ref,
) {
  const id = "email";
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-black">
        Email address
      </label>
      <div className="relative">
        <Mail
          className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          {...rest}
          ref={ref}
          id={id}
          type="email"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={254}
          placeholder="you@company.com"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={fieldInput(Boolean(error))}
        />
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
});

export default EmailField;