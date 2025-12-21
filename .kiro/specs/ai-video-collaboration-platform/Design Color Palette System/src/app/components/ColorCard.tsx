interface ColorCardProps {
  name: string;
  hex: string;
  usage: string;
}

export function ColorCard({ name, hex, usage }: ColorCardProps) {
  // Determine if text should be light or dark based on background
  const isLight = getIsLightColor(hex);
  const textColor = isLight ? "#111827" : "#FFFFFF";

  // Copy hex to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(hex);
  };

  return (
    <div className="group cursor-pointer" onClick={copyToClipboard}>
      {/* Color Rectangle */}
      <div
        className="w-full h-[100px] rounded-t-lg transition-transform group-hover:scale-105 shadow-md"
        style={{ backgroundColor: hex }}
      >
        <div className="h-full flex items-center justify-center">
          <span
            className="text-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: textColor }}
          >
            Click to copy
          </span>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white p-4 rounded-b-lg shadow-md border border-neutral-200 border-t-0">
        <div className="mb-2">
          <h4 className="text-neutral-800 mb-1">{name}</h4>
          <code className="text-sm text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
            {hex.toUpperCase()}
          </code>
        </div>
        <p className="text-xs text-neutral-500 leading-relaxed">{usage}</p>
      </div>
    </div>
  );
}

// Helper function to determine if a color is light or dark
function getIsLightColor(hex: string): boolean {
  // Remove # if present
  const cleanHex = hex.replace("#", "");

  // Convert to RGB
  const r = parseInt(cleanHex.substr(0, 2), 16);
  const g = parseInt(cleanHex.substr(2, 2), 16);
  const b = parseInt(cleanHex.substr(4, 2), 16);

  // Calculate relative luminance (simplified)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return true if light (luminance > 0.5)
  return luminance > 0.5;
}
