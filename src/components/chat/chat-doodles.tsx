import { cn } from "@/lib/utils";

interface ChatDoodlesProps {
  className?: string;
}

export function ChatDoodles({ className }: ChatDoodlesProps) {
  return (
    <div className={cn("absolute inset-0 z-0 pointer-events-none overflow-hidden", className)}>
      <svg
        className="w-full h-full opacity-[0.03] dark:opacity-[0.05]"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <pattern
          id="chat-doodles-pattern"
          x="0"
          y="0"
          width="400"
          height="400"
          patternUnits="userSpaceOnUse"
        >
          {/* Circle */}
          <circle cx="50" cy="50" r="10" fill="currentColor" />
          
          {/* Triangle */}
          <path d="M150 50 L160 70 L140 70 Z" fill="none" stroke="currentColor" strokeWidth="2" />
          
          {/* Squiggle */}
          <path d="M250 50 Q260 40 270 50 T290 50" fill="none" stroke="currentColor" strokeWidth="2" />
          
          {/* Square */}
          <rect x="50" y="150" width="15" height="15" transform="rotate(15 57.5 157.5)" fill="currentColor" />
          
          {/* Plus */}
          <path d="M150 150 L150 170 M140 160 L160 160" stroke="currentColor" strokeWidth="2" />
          
          {/* Donut */}
          <circle cx="250" cy="160" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
          
          {/* Zigzag */}
          <path d="M350 50 L360 60 L350 70 L360 80" fill="none" stroke="currentColor" strokeWidth="2" />
          
          {/* Star-ish */}
          <path d="M50 250 L60 260 M60 250 L50 260" stroke="currentColor" strokeWidth="2" />
          
          {/* Hexagon */}
          <path d="M150 250 L160 255 L160 265 L150 270 L140 265 L140 255 Z" fill="none" stroke="currentColor" strokeWidth="2" />

          {/* Lines */}
          <path d="M250 250 L270 270" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />

           {/* Circle 2 */}
           <circle cx="350" cy="250" r="5" fill="currentColor" />

           {/* Triangle 2 */}
           <path d="M100 350 L110 370 L90 370 Z" fill="currentColor" transform="rotate(45 100 360)" />

           {/* Squiggle 2 */}
           <path d="M200 350 Q210 340 220 350 T240 350" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(90 220 350)" />

        </pattern>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#chat-doodles-pattern)" />
      </svg>
    </div>
  );
}
