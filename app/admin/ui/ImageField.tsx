"use client";

/* eslint-disable @next/next/no-img-element -- previews of admin uploads and links */
import { useId, useRef, useState } from "react";
import { uploadImage } from "../actions";
import { useLang } from "../../components/LangProvider";
import { ImageIcon } from "../../components/icons";

/** Shrinks a photo in the browser to a WebP no wider than 1600px before uploading. */
async function toWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/webp", 0.84),
  );
}

export function ImageField({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  const { t } = useLang();
  const input = useRef<HTMLInputElement>(null);
  const fileId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pickFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const blob = await toWebp(file);
      const data = new FormData();
      data.set("file", new File([blob], "photo.webp", { type: "image/webp" }));
      const result = await uploadImage(data);
      if (result.url) onChange(result.url);
      else setError(result.error ?? t("تعذر رفع الصورة.", "The image could not be uploaded."));
    } catch {
      setError(t("الملف ده مش صورة نقدر نقراها.", "This file isn't an image we can read."));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="grid aspect-[4/3] w-full shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-paper sm:w-48">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImageIcon size={32} className="text-sage" />}
        </div>
        <div className="flex-1 space-y-2">
          <input ref={input} type="file" accept="image/*" className="sr-only" onChange={(e) => pickFile(e.target.files?.[0])} id={fileId} />
          <div className="flex flex-wrap gap-2">
            <label htmlFor={fileId} className={`btn btn-outline btn-sm ${busy ? "pointer-events-none opacity-60" : ""}`}>
              {busy ? t("بنرفع…", "Uploading…") : value ? t("غيّر الصورة", "Replace photo") : t("ارفع صورة", "Upload a photo")}
            </label>
            {value && (
              <button type="button" onClick={() => onChange("")} className="btn btn-ghost btn-sm">
                {t("شيل الصورة", "Remove photo")}
              </button>
            )}
          </div>
          <input
            type="url"
            value={value.startsWith("/") ? "" : value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t("أو الصق رابط صورة https://", "Or paste an image link https://")}
            className="field !min-h-10 text-sm"
            dir="ltr"
            aria-label={t("رابط الصورة", "Image link")}
          />
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        </div>
      </div>
    </div>
  );
}
