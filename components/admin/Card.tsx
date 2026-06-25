import { ReactNode } from "react";

interface CardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
}

export default function Card({ title, value, icon, color = "#102419" }: CardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#E6DED0] bg-white p-6 transition hover:shadow-md">
      <div
        className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
        style={{ backgroundColor: color }}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h2 className="mt-3 text-4xl font-bold" style={{ color }}>
            {value}
          </h2>
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ background: `${color}18`, color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
