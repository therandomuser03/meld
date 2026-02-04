import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma/client";
import { Search, Bell, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InvitationCard } from "@/components/people/invitation-card";
import { PersonCard } from "@/components/people/person-card";

export default async function PeoplePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 1. Fetch Incoming Requests
  const pendingRequests = await prisma.connectionRequest.findMany({
    where: {
      toUserId: user.id,
      status: "PENDING"
    },
    include: {
      fromUser: {
        select: { id: true, name: true, profession: true, avatarUrl: true }
      }
    }
  });

  // 2. Fetch People to Connect With (Excluding self and existing connections)
  // Simplified query for demo: fetch 8 users who are NOT me
  const suggestions = await prisma.userProfile.findMany({
    where: {
      id: { not: user.id },
      // In a real app, you'd exclude existing connections here
    },
    take: 8,
    select: {
      id: true,
      name: true,
      profession: true,
      bio: true,
      avatarUrl: true
    }
  });

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Find People</h1>
          <p className="text-slate-400">Expand your network and connect with professionals.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <Bell className="h-5 w-5" />
            {/* Notification Dot */}
            {pendingRequests.length > 0 && (
              <span className="absolute top-2 right-2.5 h-2 w-2 bg-blue-500 rounded-full" />
            )}
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Invite Friends
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by name, role, or company..."
            className="pl-10 h-11 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
          />
        </div>
        <div className="bg-slate-900/50 border border-white/10 p-1 rounded-xl flex gap-1">
          <Button variant="ghost" size="sm" className="h-9 bg-white/10 text-white rounded-lg px-4">All</Button>
          <Button variant="ghost" size="sm" className="h-9 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg px-4">Pending</Button>
          <Button variant="ghost" size="sm" className="h-9 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg px-4">Accepted</Button>
        </div>
      </div>

      {/* Invitations Section */}
      {pendingRequests.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-white">
              Invitations <span className="text-blue-500">({pendingRequests.length})</span>
            </h2>
            <Button variant="link" className="text-blue-400 h-auto p-0 text-sm">Manage all</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pendingRequests.map(req => (
              <InvitationCard key={req.id} request={req} />
            ))}
          </div>
        </section>
      )}

      {/* Discovery Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold text-white">People You May Know</h2>
          <Button variant="ghost" size="icon" className="text-slate-400">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {suggestions.map(user => (
            <PersonCard key={user.id} user={user} />
          ))}
        </div>
      </section>
    </div>
  );
}