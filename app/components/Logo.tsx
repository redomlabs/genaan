import Image from "next/image";

/** Leaf mark and the Fugaz One "genaan" wordmark from the original brand. */
export function Logo({
  tone = "dark",
  size = "md",
  className = "",
}: {
  tone?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const s = { sm: [26, "text-lg"], md: [34, "text-[1.35rem]"], lg: [44, "text-3xl"] }[size] as [number, string];
  return (
    <span dir="ltr" className={`inline-flex items-center gap-1.5 ${className}`}>
      <Image
        src="/assets/icon.png"
        alt=""
        width={s[0]}
        height={s[0]}
        priority
        className={`object-contain transition-[filter] duration-300 ${tone === "light" ? "brightness-0 invert" : ""}`}
      />
      <span
        className={`${s[1]} leading-none tracking-tight transition-colors duration-300 ${tone === "light" ? "text-white" : "text-forest"}`}
        style={{ fontFamily: "var(--font-fugaz), sans-serif" }}
      >
        genaan
      </span>
      <span className="sr-only">Genaan – جنان</span>
    </span>
  );
}
