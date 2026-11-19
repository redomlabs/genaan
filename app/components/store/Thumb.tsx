/* eslint-disable @next/next/no-img-element -- catalogue images come from admins (uploads or links) */
import { SproutIcon, TreeIcon } from "../icons";

/** A product image, or a quiet placeholder until the admin adds a photo. */
export function Thumb({
  src,
  alt,
  service = "business",
  className = "",
  priority = false,
  sizes,
}: {
  src: string;
  alt: string;
  service?: "business" | "planting";
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (!src) {
    const Icon = service === "planting" ? TreeIcon : SproutIcon;
    return (
      <div
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        className={`grid place-items-center overflow-hidden ${
          service === "planting" ? "bg-harvest-soft text-harvest" : "bg-mist text-leaf"
        } ${className}`}
      >
        <Icon size={36} strokeWidth={1.3} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      sizes={sizes}
      className={`overflow-hidden object-cover ${className}`}
    />
  );
}
