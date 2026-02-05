"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Globe, Check, CheckCheck, Languages } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DateDisplay } from "@/components/ui/date-display";
import { Button } from "@/components/ui/button";

interface MessageBubbleProps {
  content: string;
  translatedContent?: string;
  isOwn?: boolean;
  authorName?: string;
  authorAvatar?: string;
  timestamp: string | Date;
  sourceLanguage?: string; // e.g., "Spanish"
  onRequestTranslate?: () => void;
}

export function MessageBubble({
  content,
  translatedContent,
  isOwn,
  authorName,
  authorAvatar,
  timestamp,
  sourceLanguage,
  onRequestTranslate
}: MessageBubbleProps) {
  const [showOriginal, setShowOriginal] = React.useState(false);
  const displayContent = (translatedContent && !showOriginal) ? translatedContent : content;
  const hasTranslation = !!translatedContent;

  return (
    <div className={cn("flex gap-3 mb-6 items-end group/bubble", isOwn ? "flex-row-reverse" : "flex-row")}>
      {!isOwn && (
        <Avatar className="h-9 w-9 border border-border/50 shrink-0">
          <AvatarImage src={authorAvatar} />
          <AvatarFallback className="bg-bg-900 text-text-50 font-bold text-[11px]">
            {authorName?.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col max-w-[85%] md:max-w-[75%]", isOwn ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm relative transition-all shadow-sm",
            isOwn
              ? "bg-primary text-white rounded-br-none"
              : "bg-secondary text-foreground rounded-bl-none border border-border/30 backdrop-blur-sm"
          )}
        >
          <p className="leading-relaxed whitespace-pre-wrap break-words">{displayContent}</p>

          {/* Translation Footer */}
          {hasTranslation && !isOwn && (
            <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Languages className="h-3.5 w-3.5" />
                <span>
                  Translated from Spanish
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onRequestTranslate}
                  className="text-muted-foreground hover:text-primary transition-colors hover:underline"
                  title="Translate to another language"
                >
                  Change
                </button>
                <button
                  onClick={() => setShowOriginal(!showOriginal)}
                  className="text-primary hover:text-primary/80 font-bold transition-colors"
                >
                  {showOriginal ? "Show Translated" : "Show Original"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Metadata & Actions */}
        <div className="flex items-center gap-2 mt-1.5 px-1">
          <span className="text-[11px] text-muted-foreground font-medium">
            <DateDisplay date={timestamp} format="time" />
          </span>
          {isOwn ? (
            <CheckCheck className="h-3.5 w-3.5 text-primary opacity-80" />
          ) : (
            <>
              {!translatedContent && (
                <button
                  onClick={onRequestTranslate}
                  className="ml-2 text-[10px] font-medium text-primary hover:underline flex items-center gap-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity"
                >
                  <Languages className="h-3 w-3" />
                  Translate
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}