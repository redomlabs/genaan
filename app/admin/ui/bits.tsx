import { ORDER_STATUS_LABELS, type Lang, type OrderStatus } from "../../lib/types";

export function PageHeader({ title, intro, action }: { title: string; intro?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {intro && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-moss">{intro}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  new: "bg-harvest-soft text-harvest-deep",
  confirmed: "bg-mist text-canopy",
  scheduled: "bg-[#e3eef7] text-[#1f4f75]",
  completed: "bg-forest text-white",
  cancelled: "bg-[#f3e4e4] text-danger",
};

export function StatusBadge({ status, lang }: { status: OrderStatus; lang: Lang }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[status]}`}>
      {lang === "ar" ? ORDER_STATUS_LABELS[status].ar : ORDER_STATUS_LABELS[status].en}
    </span>
  );
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[var(--radius-card)] border border-line-soft bg-white p-5 md:p-6 ${className}`}>{children}</section>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-[var(--radius-card)] border border-dashed border-line p-10 text-center text-sm text-moss">{children}</p>;
}
