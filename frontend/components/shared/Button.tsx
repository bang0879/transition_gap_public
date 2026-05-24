"use client";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "teal";
}

export function Button({
  variant = "default",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const classes =
    variant === "primary" || variant === "teal"
      ? "border-teal bg-teal text-white hover:bg-teal-deep"
      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300";

  return (
    <button
      type="button"
      className={`inline-flex h-10 items-center justify-center rounded-full border px-[16px] text-[13px] font-[680] transition-colors disabled:cursor-not-allowed disabled:opacity-50 print:hidden ${classes} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
