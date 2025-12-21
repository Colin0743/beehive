import { Hexagon } from "lucide-react";

interface LogoProps {
  size?: "small" | "medium" | "large";
  showText?: boolean;
}

export function Logo({ size = "medium", showText = true }: LogoProps) {
  const sizes = {
    small: { icon: 20, text: "text-base" },
    medium: { icon: 28, text: "text-xl" },
    large: { icon: 40, text: "text-3xl" },
  };

  const currentSize = sizes[size];

  return (
    <div className="flex items-center gap-2">
      {/* Hexagonal Beehive Logo */}
      <div className="relative">
        {/* Outer Hexagon */}
        <Hexagon
          size={currentSize.icon}
          className="text-[#FFD700]"
          strokeWidth={2.5}
          fill="#FFD700"
          fillOpacity={0.1}
        />
        {/* Inner Hexagon Pattern */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-[1px]">
            <div className="w-[3px] h-[3px] bg-[#FFD700] rounded-full" />
            <div className="w-[3px] h-[3px] bg-[#FFD700] rounded-full" />
            <div className="w-[3px] h-[3px] bg-[#FFD700] rounded-full" />
            <div className="w-[3px] h-[3px] bg-[#FFD700] rounded-full" />
          </div>
        </div>
      </div>

      {/* Logo Text */}
      {showText && (
        <span className={`${currentSize.text} font-semibold text-[#FFD700]`}>
          蜂巢
        </span>
      )}
    </div>
  );
}
