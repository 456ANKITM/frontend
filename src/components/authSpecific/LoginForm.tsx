// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Info } from "lucide-react";
// import LoadingButton from "@/components/common/LoadingButton";
// import AuthError from "./AuthError";
// import EmailField from "./EmailField";
// import PasswordField from "./PasswordField";
// import { loginSchema, type LoginValues } from "@/schema/loginSchema";
// import { AuthFailureError, mockLogin, type AuthFailure } from "@/utils/mockLogin";
// import { getRoleDestination } from "@/utils/roleRedirect";

// export default function LoginForm() {
//   const router = useRouter();
//   const [failure, setFailure] = useState<AuthFailure | null>(null);
//   const [retryIn, setRetryIn] = useState(0);
//   const [redirecting, setRedirecting] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     setFocus,
//     formState: { errors, isSubmitting },
//   } = useForm<LoginValues>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: { email: "", password: "", remember: false },
//   });

//   const isBusy = isSubmitting || redirecting;

//   // Rate-limit countdown: re-enable the form when it reaches zero.
//   useEffect(() => {
//     if (retryIn <= 0) return;
//     const t = setTimeout(() => {
//       setRetryIn((s) => s - 1);
//       if (retryIn - 1 <= 0) {
//         setFailure((f) => (f?.kind === "rateLimited" ? null : f));
//       }
//     }, 1000);
//     return () => clearTimeout(t);
//   }, [retryIn]);

//   const onSubmit = async (values: LoginValues) => {
//     setFailure(null);
//     try {
//       // TODO(integration): replace with POST /api/v1/auth/login
//       // (values.remember controls the extended-session option).
//       const { role } = await mockLogin(values.email, values.password);
//       setRedirecting(true);
//       router.replace(getRoleDestination(role));
//     } catch (err) {
//       const f: AuthFailure =
//         err instanceof AuthFailureError ? err.failure : { kind: "network" };
//       setFailure(f);
//       if (f.kind === "rateLimited") setRetryIn(f.retryAfterSeconds ?? 30);
//       // Keep the email; clear only the password.
//       setValue("password", "");
//       if (f.kind === "invalid") setFocus("password");
//     }
//   };

//   return (
//     <div>
//       <h1 className="font-display text-[32px] font-semibold leading-tight tracking-tight text-foreground">
//         Welcome back
//       </h1>
//       <p className="mt-2 text-[15px] leading-relaxed text-[#5B6475]">
//         Sign in to manage your business, stores, inventory and sales.
//       </p>

//       <AuthError failure={failure} retryIn={retryIn} />

//       <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
//         <EmailField error={errors.email?.message} {...register("email")} />

//         <PasswordField
//           error={errors.password?.message}
//           labelAction={
//             <Link
//               href="/forgot-password"
//               className="rounded text-sm font-medium text-[#2438C9] outline-none hover:underline focus-visible:ring-4 focus-visible:ring-[#2438C9]/25"
//             >
//               Forgot password?
//             </Link>
//           }
//           {...register("password")}
//         />

//         <div className="flex items-start gap-3">
//           <input
//             id="remember"
//             type="checkbox"
//             aria-describedby="remember-hint"
//             className="mt-0.5 h-4.5 w-4.5 shrink-0 cursor-pointer rounded border-[#CBD2E0] accent-[#2438C9] outline-none focus-visible:ring-4 focus-visible:ring-[#2438C9]/25"
//             {...register("remember")}
//           />
//           <div>
//             <label htmlFor="remember" className="cursor-pointer text-sm font-medium text-foreground">
//               Keep me signed in
//             </label>
//             <p id="remember-hint" className="mt-0.5 text-[13px] leading-snug text-[#5B6475]">
//               Stays signed in on this device for longer. Your session policy still applies.
//             </p>
//           </div>
//         </div>

//         <LoadingButton
//           type="submit"
//           loading={isBusy}
//           loadingLabel="Signing in..."
//           disabled={retryIn > 0}
//         >
//           Sign in
//         </LoadingButton>

//         {/* Announces progress to screen readers without moving focus */}
//         <p role="status" className="sr-only">
//           {isBusy ? "Signing in..." : ""}
//         </p>
//       </form>

//       <hr className="my-7 border-[#E3E7EF]" />

//       <p className="text-center text-sm text-[#5B6475]">
//         Don&apos;t have an account?{" "}
//         <Link
//           href="/register"
//           className="rounded font-semibold text-[#2438C9] outline-none hover:underline focus-visible:ring-4 focus-visible:ring-[#2438C9]/25"
//         >
//           Create your business
//         </Link>
//       </p>

//       <p className="mt-6 flex items-start gap-2 rounded-xl bg-[#F6F7FB] px-4 py-3 text-[13px] leading-snug text-[#5B6475]">
//         <Info className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
//         <span>Using a shared computer? Leave “Keep me signed in” unchecked.</span>
//       </p>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import LoadingButton from "@/components/common/LoadingButton";
import AuthError from "./AuthError";
import EmailField from "./EmailField";
import PasswordField from "./PasswordField";
import { loginSchema, type LoginValues } from "@/schema/loginSchema";
import {
  AuthFailureError,
  mockLogin,
  type AuthFailure,
} from "@/utils/mockLogin";
import { getRoleDestination } from "@/utils/roleRedirect";

export default function LoginForm() {
  const router = useRouter();
  const [failure, setFailure] = useState<AuthFailure | null>(null);
  const [retryIn, setRetryIn] = useState(0);
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const isBusy = isSubmitting || redirecting;

  // Rate-limit countdown: re-enable the form when it reaches zero.
  useEffect(() => {
    if (retryIn <= 0) return;
    const t = setTimeout(() => {
      setRetryIn((s) => s - 1);
      if (retryIn - 1 <= 0) {
        setFailure((f) => (f?.kind === "rateLimited" ? null : f));
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [retryIn]);

  const onSubmit = async (values: LoginValues) => {
    setFailure(null);
    try {
      // TODO(integration): replace with POST /api/v1/auth/login
      // (values.remember controls the extended-session option).
      const { role } = await mockLogin(values.email, values.password);
      setRedirecting(true);
      router.replace(getRoleDestination(role));
    } catch (err) {
      const f: AuthFailure =
        err instanceof AuthFailureError ? err.failure : { kind: "network" };
      setFailure(f);
      if (f.kind === "rateLimited") setRetryIn(f.retryAfterSeconds ?? 30);
      // Keep the email; clear only the password.
      setValue("password", "");
      if (f.kind === "invalid") setFocus("password");
    }
  };

  return (
    <div>
      <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">
        Welcome back
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
        Sign in to manage your business, stores, inventory and sales.
      </p>

      <AuthError failure={failure} retryIn={retryIn} />

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="mt-5 space-y-4"
      >
        <EmailField error={errors.email?.message} {...register("email")} />

        <PasswordField
          error={errors.password?.message}
          labelAction={
            <Link
              href="/forgot-password"
              className="rounded text-sm font-medium text-black outline-none hover:underline focus-visible:ring-4 focus-visible:ring-black/20"
            >
              Forgot password?
            </Link>
          }
          {...register("password")}
        />

        <div className="flex items-start gap-3">
          <input
            id="remember"
            type="checkbox"
            aria-describedby="remember-hint"
            className="mt-0.5 h-4.5 w-4.5 shrink-0 cursor-pointer rounded border-gray-300 accent-black outline-none focus-visible:ring-4 focus-visible:ring-black/20"
            {...register("remember")}
          />
          <div>
            <label
              htmlFor="remember"
              className="cursor-pointer text-sm font-medium text-black"
            >
              Keep me signed in
            </label>
            <p
              id="remember-hint"
              className="mt-0.5 text-[13px] leading-snug text-gray-600 [@media(max-height:760px)]:hidden"
            >
              Stays signed in on this device for longer. Your session policy
              still applies.
            </p>
          </div>
        </div>

        <LoadingButton
          type="submit"
          loading={isBusy}
          loadingLabel="Signing in..."
          disabled={retryIn > 0}
        >
          Sign in
        </LoadingButton>

        {/* Announces progress to screen readers without moving focus */}
        <p role="status" className="sr-only">
          {isBusy ? "Signing in..." : ""}
        </p>
      </form>

      <hr className="my-5 border-gray-200" />

      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="rounded font-semibold text-black outline-none hover:underline focus-visible:ring-4 focus-visible:ring-black/20"
        >
          Create your business
        </Link>
      </p>

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-[13px] leading-snug text-gray-600 [@media(max-height:760px)]:hidden">
        <Info className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          Using a shared computer? Leave “Keep me signed in” unchecked.
        </span>
      </p>
    </div>
  );
}
