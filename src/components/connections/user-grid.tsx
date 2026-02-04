"use client";

import * as React from "react";
import { Search, Filter, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PersonCard } from "@/components/connections/person-card";
import { searchUsers } from "@/lib/actions/connections";
import debounce from "lodash/debounce";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
    id: string;
    name: string | null;
    profession: string | null;
    bio: string | null;
    avatarUrl: string | null;
    status?: "NONE" | "PENDING" | "CONNECTED";
    mutualCount?: number;
}

interface UserGridProps {
    currentUserId: string;
    initialSuggestions: User[];
    initialPending: User[];
    initialAccepted: User[];
}

export function UserGrid({ currentUserId, initialSuggestions, initialPending, initialAccepted }: UserGridProps) {
    const [suggestions, setSuggestions] = React.useState<User[]>(initialSuggestions);
    const [isSearching, setIsSearching] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");

    const debouncedSearch = React.useCallback(
        debounce(async (query: string) => {
            if (!query.trim()) {
                setSuggestions(initialSuggestions);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            try {
                const results = await searchUsers(query);
                setSuggestions(results);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsSearching(false);
            }
        }, 500),
        [initialSuggestions]
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.trim()) {
            setIsSearching(true);
        }

        debouncedSearch(value);
    };

    const renderGrid = (users: User[], emptyMessage: string) => {
        if (users.length === 0) {
            return (
                <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-white/5">
                    <p className="text-slate-500 text-sm">{emptyMessage}</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {users.map((user) => (
                    <PersonCard
                        key={user.id}
                        user={user}
                        status={user.status || "NONE"}
                        currentUserId={currentUserId}
                    />
                ))}
            </div>
        );
    };

    return (
        <Tabs defaultValue="all" className="space-y-8">
            {/* Search & Tabs Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <TabsList className="bg-slate-900/50 border border-white/10 p-1 h-auto self-start">
                    <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 px-6 py-2 rounded-lg transition-all"
                    >
                        All
                    </TabsTrigger>
                    <TabsTrigger
                        value="pending"
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 px-6 py-2 rounded-lg transition-all"
                    >
                        Pending ({initialPending.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="accepted"
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 px-6 py-2 rounded-lg transition-all"
                    >
                        Accepted ({initialAccepted.length})
                    </TabsTrigger>
                </TabsList>

                <div className="relative w-full lg:max-w-md">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4 text-slate-500">
                        {isSearching ? <Loader2 className="animate-spin w-full h-full" /> : <Search className="w-full h-full" />}
                    </div>
                    <Input
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search for new people..."
                        className="pl-10 h-11 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:ring-blue-600"
                    />
                </div>
            </div>

            <TabsContent value="all" className="space-y-6 mt-0">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        {searchTerm ? "Search Results" : "Discovery"}
                    </h2>
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
                {renderGrid(suggestions, "No people found.")}
            </TabsContent>

            <TabsContent value="pending" className="mt-0">
                <h2 className="text-xl font-bold text-white tracking-tight mb-6">Invitations Sent</h2>
                {renderGrid(initialPending, "You haven't sent any invitations recently.")}
            </TabsContent>

            <TabsContent value="accepted" className="mt-0">
                <h2 className="text-xl font-bold text-white tracking-tight mb-6">Your Network</h2>
                {renderGrid(initialAccepted, "You haven't connected with anyone yet.")}
            </TabsContent>
        </Tabs>
    );
}
