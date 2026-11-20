"use client";

/* eslint-disable @next/next/no-img-element -- admin previews */
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteProject, saveProject, setPortfolioVisible, type ProjectInput } from "../actions";
import { useLang } from "../../components/LangProvider";
import type { Project } from "../../lib/data";
import { ImageField } from "./ImageField";
import { CloseIcon } from "../../components/icons";

export function PortfolioSwitch({ enabled, count }: { enabled: boolean; count: number }) {
  const { t } = useLang();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-card)] border p-5 ${enabled ? "border-canopy bg-mist/60" : "border-line-soft bg-white"}`}>
      <input
        type="checkbox"
        checked={enabled}
        disabled={pending}
        onChange={(e) =>
          start(async () => {
            await setPortfolioVisible(e.target.checked);
            router.refresh();
          })
        }
        className="mt-1 h-5 w-5 accent-[var(--color-canopy)]"
      />
      <span>
        <span className="block font-bold">{t("اعرض «أعمالنا» في الصفحة الرئيسية", "Show “Our work” on the home page")}</span>
        <span className="block text-sm text-moss">
          {enabled
            ? count > 0
              ? t("القسم ظاهر للزوار دلوقتي.", "Visitors can see the section now.")
              : t("مفعّل، بس مش هيظهر لحد ما تضيف شغل ظاهر.", "On, but it stays hidden until you add a visible project.")
            : t("القسم مخفي عن الزوار.", "The section is hidden from visitors.")}
        </span>
      </span>
    </label>
  );
}

const empty = (): ProjectInput => ({
  service: "business",
  titleAr: "",
  titleEn: "",
  clientAr: "",
  clientEn: "",
  descriptionAr: "",
  descriptionEn: "",
  images: [],
  isActive: true,
  sortOrder: "0",
});

export function ProjectEditor({ project, onDone }: { project: Project | null; onDone: () => void }) {
  const { t } = useLang();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState<ProjectInput>(
    project
      ? { ...project, sortOrder: String(project.sortOrder) }
      : empty(),
  );
  const set = <K extends keyof ProjectInput>(k: K, v: ProjectInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        start(async () => {
          const r = await saveProject(form);
          if (r.error) setError(r.error);
          else {
            router.refresh();
            onDone();
          }
        });
      }}
      className="space-y-5 rounded-[var(--radius-card)] border border-line-soft bg-white p-5 md:p-6"
    >
      <fieldset>
        <legend className="label">{t("نوع الشغل", "Type of work")}</legend>
        <div className="flex flex-wrap gap-2">
          {(["business", "planting"] as const).map((s) => (
            <label key={s} className="inline-flex cursor-pointer items-center rounded-full border border-line px-3.5 py-1.5 text-sm has-[:checked]:border-forest has-[:checked]:bg-forest has-[:checked]:text-white">
              <input type="radio" className="sr-only" checked={form.service === s} onChange={() => set("service", s)} />
              {s === "business" ? t("تجهيز مكان شغل", "Workplace") : t("زراعة حديقة أو أرض", "Garden or land planting")}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className="label">{t("العنوان بالعربي", "Title in Arabic")}</span><input dir="rtl" required value={form.titleAr} onChange={(e) => set("titleAr", e.target.value)} placeholder="عيادة أسنان في التجمع" className="field" /></label>
        <label className="block"><span className="label">{t("العنوان بالإنجليزي", "Title in English")}</span><input dir="ltr" required value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} placeholder="Dental clinic, New Cairo" className="field" /></label>
        <label className="block"><span className="label">{t("العميل بالعربي (اختياري)", "Client in Arabic (optional)")}</span><input dir="rtl" value={form.clientAr} onChange={(e) => set("clientAr", e.target.value)} className="field" /></label>
        <label className="block"><span className="label">{t("العميل بالإنجليزي (اختياري)", "Client in English (optional)")}</span><input dir="ltr" value={form.clientEn} onChange={(e) => set("clientEn", e.target.value)} className="field" /></label>
        <label className="block"><span className="label">{t("وصف قصير بالعربي", "Short description in Arabic")}</span><textarea dir="rtl" rows={3} value={form.descriptionAr} onChange={(e) => set("descriptionAr", e.target.value)} className="field" /></label>
        <label className="block"><span className="label">{t("وصف قصير بالإنجليزي", "Short description in English")}</span><textarea dir="ltr" rows={3} value={form.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} className="field" /></label>
      </div>

      <div>
        <span className="label">{t("الصور (أول صورة هي الغلاف)", "Photos (the first is the cover)")}</span>
        {form.images.length > 0 && (
          <ul className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {form.images.map((src, i) => (
              <li key={src + i} className="relative">
                <img src={src} alt="" className="aspect-square w-full rounded-lg object-cover" />
                {i === 0 && <span className="absolute bottom-1 start-1 rounded bg-forest px-1.5 text-[10px] font-bold text-white">{t("غلاف", "Cover")}</span>}
                <div className="absolute top-1 end-1 flex gap-1">
                  {i > 0 && (
                    <button type="button" onClick={() => set("images", [src, ...form.images.filter((_, j) => j !== i)])} className="rounded bg-white/90 px-1.5 text-[10px] font-bold" aria-label={t("اجعلها الغلاف", "Make cover")}>
                      {t("غلاف", "Cover")}
                    </button>
                  )}
                  <button type="button" onClick={() => set("images", form.images.filter((_, j) => j !== i))} className="grid h-5 w-5 place-items-center rounded bg-white/90 text-danger" aria-label={t("شيل الصورة", "Remove photo")}>
                    <CloseIcon size={12} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {form.images.length < 12 && (
          <ImageField
            key={form.images.length}
            label={t("ضيف صورة", "Add a photo")}
            value=""
            onChange={(url) => url && set("images", [...form.images, url])}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="h-4 w-4 accent-[var(--color-canopy)]" />
          {t("ظاهر في القسم", "Shown in the section")}
        </label>
        <label className="flex items-center gap-2 text-sm">
          {t("الترتيب", "Order")}
          <input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} className="field num !min-h-9 w-20 !py-1" />
        </label>
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-danger">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={pending} className="btn btn-primary">{pending ? t("بنحفظ…", "Saving…") : t("احفظ", "Save")}</button>
        <button type="button" onClick={onDone} className="btn btn-ghost">{t("إلغاء", "Cancel")}</button>
        {project && (
          <button
            type="button"
            disabled={pending}
            className="btn btn-outline ms-auto text-danger"
            onClick={() => {
              if (!confirm(t("تحذف الشغل ده؟", "Delete this project?"))) return;
              start(async () => {
                await deleteProject(project.id);
                router.refresh();
                onDone();
              });
            }}
          >
            {t("احذف", "Delete")}
          </button>
        )}
      </div>
    </form>
  );
}

export function PortfolioManager({ projects }: { projects: Project[] }) {
  const { t, lang } = useLang();
  const [editing, setEditing] = useState<Project | "new" | null>(null);

  if (editing) return <ProjectEditor project={editing === "new" ? null : editing} onDone={() => setEditing(null)} />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">{t("الشغل", "Projects")}</h2>
        <button type="button" onClick={() => setEditing("new")} className="btn btn-primary btn-sm">{t("إضافة شغل", "Add a project")}</button>
      </div>
      {projects.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line p-10 text-center text-sm text-moss">
          {t("ضيف أول شغل بصوره علشان يظهر في القسم.", "Add your first project with photos so the section has something to show.")}
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => setEditing(p)} className="flex w-full items-center gap-3 rounded-[var(--radius-card)] border border-line-soft bg-white p-3 text-start hover:border-canopy">
                <img src={p.images[0]} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{lang === "ar" ? p.titleAr : p.titleEn}</span>
                  <span className="num block text-xs text-moss">
                    {t(`${p.images.length} صورة`, `${p.images.length} photos`)}
                    {!p.isActive && <span className="ms-2 rounded bg-paper px-1.5 font-semibold">{t("مخفي", "Hidden")}</span>}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
