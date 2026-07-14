import { cloneElement, isValidElement, type ReactElement } from "react";
import { cn } from "@/lib/utils";

type SoftButtonProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function SoftButton({
  children,
  className,
  variant = "secondary",
  asChild = false,
  type = "button",
  ...props
}: SoftButtonProps) {
  const classes = cn("soft-button focus-ring", `soft-button-${variant}`, className);

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>;
    return cloneElement(child, {
      className: cn(classes, child.props.className)
    });
  }

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}
