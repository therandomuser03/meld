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
    <div className={cn("flex gap-3 mb-6", isOwn ? "flex-row-reverse" : "flex-row")}>
      {!isOwn && (
        <Avatar className="h-8 w-8 mt-1 border border-border">
          <AvatarImage src={authorAvatar} />
          <AvatarFallback className="bg-secondary text-text">
            {authorName?.substring(0, 2)}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col max-w-[70%]", isOwn ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm relative group transition-all",
            isOwn
              ? "bg-primary text-primary-foreground rounded-tr-sm shadow-md shadow-primary/10"
              : "bg-secondary text-text rounded-tl-sm border border-border shadow-sm"
          )}
        >
          <p className="leading-relaxed whitespace-pre-wrap">{displayContent}</p>

          {/* Translation Footer */}
          {hasTranslation && !isOwn && (
            <div className="mt-2 pt-2 border-t border-border/50 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]">
              <div className="flex items-center gap-1.5">
                <Globe className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {showOriginal ? "Original" : "Translated"}
                </span>
              </div>

              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                {showOriginal ? "Show Transl." : "Show Orig."}
              </button>

              {onRequestTranslate && (
                <button
                  onClick={onRequestTranslate}
                  className="text-muted-foreground hover:text-text transition-colors flex items-center gap-1"
                  title="Translate to another language"
                >
                  <Languages className="h-3 w-3" />
                  Other
                </button>
              )}
            </div>
          )}

          {/* Translate Button trigger if not translated yet */}
          {!hasTranslation && !isOwn && onRequestTranslate && (
            <div className="mt-2 pt-1 border-t border-border/50 transition-opacity flex">
              <button
                onClick={onRequestTranslate}
                className="flex items-center gap-1.5 text-[10px] text-primary hover:text-primary/80 transition-colors font-semibold"
              >
                <Languages className="h-3 w-3" />
                Translate
              </button>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-[10px] text-muted-foreground">
            <DateDisplay date={timestamp} format="time" />
          </span>
          {isOwn && (
            <CheckCheck className="h-3 w-3 text-primary" />
          )}
        </div>
      </div>
    </div>
  );
}