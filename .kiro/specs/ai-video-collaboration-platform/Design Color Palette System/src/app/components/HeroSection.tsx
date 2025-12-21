import { Hexagon } from "lucide-react";
import { Film } from "lucide-react";

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden rounded-b-3xl"
      style={{
        background: "linear-gradient(135deg, #FFF9E6 0%, #FFD700 100%)",
        height: "400px",
      }}
    >
      {/* Background Hexagons */}
      <div className="absolute top-8 left-12 rotate-[-12deg] opacity-[0.08]">
        <Hexagon size={64} className="text-[#111827]" strokeWidth={1.5} />
      </div>
      <div className="absolute top-12 right-16 rotate-[12deg] opacity-[0.08]">
        <Hexagon size={64} className="text-[#111827]" strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-16 left-20 rotate-[8deg] opacity-[0.08]">
        <Hexagon size={64} className="text-[#111827]" strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-12 right-24 rotate-[-8deg] opacity-[0.08]">
        <Hexagon size={64} className="text-[#111827]" strokeWidth={1.5} />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-[1440px] mx-auto px-8 pt-12 flex flex-col items-center">
        <h1
          className="text-5xl text-center text-[#111827] mb-4"
          style={{ letterSpacing: "-0.02em" }}
        >
          让创意在蜂巢中绽放
        </h1>
        <p className="text-lg text-center text-[#1F2937] max-w-[800px] mb-8">
          蜂巢是AI视频创作者的协作平台，加入蜂巢，与优秀创作者一起完成AI视频作品
        </p>

        {/* Process Comic Placeholder */}
        <div className="w-full max-w-[900px] h-[200px] bg-white/40 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/60 shadow-lg">
          <div className="text-center">
            <Film className="w-12 h-12 mx-auto mb-3 text-neutral-700" strokeWidth={1.5} />
            <p className="text-sm text-neutral-700">流程漫画</p>
            <p className="text-xs text-neutral-600 mt-1">创意 → 协作 → 制作 → 发布</p>
          </div>
        </div>
      </div>
    </section>
  );
}