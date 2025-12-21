import { useState } from "react";

const categories = ["全部", "科幻", "动画", "纪录片", "教育", "其他"];

export function CategoryTabs() {
  const [selected, setSelected] = useState("全部");

  return (
    <div className="bg-white border-b border-neutral-200">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="flex gap-8 h-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelected(category)}
              className={`relative text-sm transition-colors ${
                selected === category
                  ? "text-neutral-900"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {category}
              {selected === category && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFD700]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
