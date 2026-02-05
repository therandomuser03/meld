import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";

export default async function TaskHistoryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const completedTasks = await prisma.task.findMany({
        where: {
            authorId: user.id,
            status: 'DONE'
        },
        orderBy: { updatedAt: 'desc' }
    });

    return (
        <div className="mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" asChild size="icon" className="text-slate-400 hover:text-white">
                    <Link href="/tasks"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Task History</h1>
                    <p className="text-slate-400">Archive of all completed items.</p>
                </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900/50 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900 border-b border-white/10 text-slate-400 font-medium">
                        <tr>
                            <th className="p-4">Task</th>
                            <th className="p-4">Completed On</th>
                            <th className="p-4">Priority</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {completedTasks.map((task: { id: Key | null | undefined; title: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; updatedAt: string | number | Date; }) => (
                            <tr key={task.id} className="group hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        <span className="font-medium text-slate-200 line-through decoration-slate-600">
                                            {task.title}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-500">
                                    {new Date(task.updatedAt).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    <Badge variant="outline" className="border-white/10 text-slate-400">
                                        Medium
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                        {completedTasks.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-slate-500">
                                    No completed tasks found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}