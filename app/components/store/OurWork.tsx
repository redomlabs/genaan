"use client";

/* eslint-disable @next/next/no-img-element -- admin-uploaded photos */
import { useEffect, useRef, useState } from "react";
import { useLang } from "../LangProvider";
import { ChevronIcon, CloseIcon } from "../icons";

export type WorkItem = {
  id: number;
  service: "business" | "planting";
  titleAr: string;
  titleEn: string;
  clientAr: string;
  clientEn: string;
  descriptionAr: string;
  descriptionEn: string;
  images: string[];
};

export function OurWork({ projects }: { projects: WorkItem[] }) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState<{ project: WorkItem; index: number } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const pick = (ar: string, en: string) => (lang === "ar" ? ar : en);

  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);

  const step = (delta: number) =>
    setOpen((o) => (o ? { ...o, index: (o.index + delta + o.project.images.length) % o.project.images.length } : o));

  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <li key={p.id}>
            <button type="button" onClick={() => setOpen({ project: p, index: 0 })} className="group block w-full text-start">
              <span className="relative block overflow-hidden rounded-[var(--radius-card)]">
                <img src={p.images[0]} alt={pick(p.titleAr, p.titleEn)} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                {p.images.length > 1 && (
                  <span className="num absolute bottom-3 end-3 rounded-full bg-forest/85 px-2.5 py-1 text-xs font-bold text-white">
                    {t(`${p.images.length} صور`, `${p.images.length} photos`)}
                  </span>
                )}
              </span>
              <span className={`mt-3 block text-xs font-bold ${p.service === "planting" ? "text-harvest-deep" : "text-canopy"}`}>
                {p.service === "planting" ? t("زراعة", "Planting") : t("تجهيز مكان شغل", "Workplace")}
                {pick(p.clientAr, p.clientEn) && <span className="font-normal text-moss"> {t("،", ",")} {pick(p.clientAr, p.clientEn)}</span>}
              </span>
              <span className="mt-0.5 block font-bold">{pick(p.titleAr, p.titleEn)}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === e.currentTarget && setOpen(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") step(lang === "ar" ? 1 : -1);
          if (e.key === "ArrowRight") step(lang === "ar" ? -1 : 1);
        }}
        className="m-auto w-[min(64rem,calc(100%-2rem))] overflow-hidden rounded-[var(--radius-panel)] bg-paper p-0 text-forest"
        aria-label={open ? pick(open.project.titleAr, open.project.titleEn) : undefined}
      >
        {open && (
          <div>
            <div className="relative bg-forest-deep">
              <img src={open.project.images[open.index]} alt="" className="max-h-[70svh] w-full object-contain" />
              {open.project.images.length > 1 && (
                <>
                  <button type="button" onClick={() => step(-1)} className="absolute start-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90" aria-label={t("السابقة", "Previous")}>
                    <ChevronIcon size={20} className="-scale-x-100 rtl:scale-x-100" />
                  </button>
                  <button type="button" onClick={() => step(1)} className="absolute end-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90" aria-label={t("التالية", "Next")}>
                    <ChevronIcon size={20} />
                  </button>
                </>
              )}
              <button type="button" onClick={() => setOpen(null)} className="absolute top-3 end-3 grid h-10 w-10 place-items-center rounded-full bg-white/90" aria-label={t("إغلاق", "Close")}>
                <CloseIcon size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-3 p-5 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-lg font-bold">{pick(open.project.titleAr, open.project.titleEn)}</h3>
                {pick(open.project.descriptionAr, open.project.descriptionEn) && (
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-moss">{pick(open.project.descriptionAr, open.project.descriptionEn)}</p>
                )}
              </div>
              {open.project.images.length > 1 && (
                <div className="flex shrink-0 gap-1.5">
                  {open.project.images.map((src, i) => (
                    <button key={src + i} type="button" onClick={() => setOpen({ ...open, index: i })} aria-label={t(`صورة ${i + 1}`, `Photo ${i + 1}`)} aria-current={i === open.index}>
                      <img src={src} alt="" className={`h-12 w-12 rounded-md object-cover ${i === open.index ? "ring-2 ring-canopy" : "opacity-70"}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
