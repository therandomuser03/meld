"use client";

import * as React from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CreateTaskDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAllDay, setIsAllDay] = React.useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title");
    const priority = formData.get("priority");
    const startDateRaw = formData.get("startDate") as string;
    const endDateRaw = formData.get("endDate") as string;
    const eventDateRaw = formData.get("eventDate") as string;

    let finalStart = null;
    let finalEnd = null;

    if (isAllDay && eventDateRaw) {
      finalStart = new Date(`${eventDateRaw}T00:00:00`).toISOString();
      finalEnd = new Date(`${eventDateRaw}T23:59:59.999`).toISOString();
    } else if (!isAllDay) {
      finalStart = startDateRaw ? new Date(startDateRaw).toISOString() : null;
      finalEnd = endDateRaw ? new Date(endDateRaw).toISOString() : null;
    }

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title,
          priority,
          isAllDay,
          startDate: finalStart,
          endDate: finalEnd
        })
      });

      if (!res.ok) throw new Error();

      toast.success("Task created");
      setOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to create task");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="h-4 w-4" /> New Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Task Title</Label>
            <Input
              name="title"
              required
              placeholder="e.g., Fix Navigation Bug"
              className="bg-background border-border text-foreground accent-primary"
            />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select name="priority" defaultValue="MEDIUM">
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HIGH">High Priority</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 py-2">
            <Checkbox
              id="all-day"
              checked={isAllDay}
              onCheckedChange={(c) => setIsAllDay(!!c)}
              className="bg-white border-white data-[state=checked]:bg-primary data-[state=checked]:border-primary text-primary-foreground"
            />
            <label
              htmlFor="all-day"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              All day event
            </label>
          </div>

          {isAllDay ? (
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                name="eventDate"
                type="date"
                required
                className="bg-background border-border text-foreground block w-full"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start</Label>
                <Input
                  name="startDate"
                  type="datetime-local"
                  required
                  className="bg-background border-border text-foreground block w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>End</Label>
                <Input
                  name="endDate"
                  type="datetime-local"
                  required
                  className="bg-background border-border text-foreground block w-full"
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button disabled={isLoading} type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}