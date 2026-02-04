"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, Clock, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PersonCardProps {
  user: {
    id: string;
    name: string | null;
    profession: string | null;
    bio: string | null;
    avatarUrl: string | null;
  };
  status?: "NONE" | "PENDING" | "CONNECTED"; // Derived from DB check
}

export function PersonCard({ user, status = "NONE" }: PersonCardProps) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/connections/request", {
        method: "POST",
        body: JSON.stringify({ toUserId: user.id }),
      });
      if (!res.ok) throw new Error();
      
      setCurrentStatus("PENDING");
      toast.success(`Request sent to ${user.name}`);
    } catch (e) {
      toast.error("Failed to send request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group bg-slate-900/50 border border-white/10 hover:border-blue-500/30 p-6 rounded-2xl flex flex-col items-center text-center transition-all">
      <div className="relative mb-4">
        <Avatar className="h-20 w-20 border-2 border-slate-800 shadow-xl">
          <AvatarImage src={user.avatarUrl || ""} />
          <AvatarFallback className="bg-slate-800 text-slate-300 text-xl">
            {user.name?.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {/* Online Indicator Mock */}
        <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-slate-900" />
      </div>

      <h3 className="font-bold text-white text-lg mb-1 line-clamp-1">{user.name}</h3>
      <p className="text-sm text-blue-400 font-medium mb-3 line-clamp-1">
        {user.profession || "Member"}
      </p>
      
      <p className="text-xs text-slate-400 line-clamp-2 mb-6 h-8 px-2">
        {user.bio || "Building things with code and coffee."}
      </p>

      <div className="mt-auto w-full">
        {currentStatus === "CONNECTED" ? (
           <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <MessageSquare className="h-4 w-4" /> Message
           </Button>
        ) : currentStatus === "PENDING" ? (
           <Button disabled variant="secondary" className="w-full bg-white/5 text-slate-400 gap-2">
              <Clock className="h-4 w-4" /> Pending
           </Button>
        ) : (
           <Button 
             variant="outline" 
             onClick={handleConnect}
             disabled={isLoading}
             className="w-full border-white/10 text-white hover:bg-white/5 hover:text-white gap-2 group-hover:border-blue-500/50 group-hover:text-blue-400"
           >
              <UserPlus className="h-4 w-4" /> Connect
           </Button>
        )}
      </div>
    </div>
  );
}