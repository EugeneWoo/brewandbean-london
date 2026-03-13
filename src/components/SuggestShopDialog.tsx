import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const schema = z.object({
  shopName: z.string().min(2, "At least 2 characters"),
  mapsUrl: z
    .string()
    .url("Must be a valid URL")
    .refine(
      (val) =>
        val.includes("maps.google.com") ||
        val.includes("maps.app.goo.gl") ||
        val.includes("goo.gl/maps"),
      { message: "Must be a Google Maps URL" }
    ),
  reason: z.string().max(500, "Keep it under 500 characters").optional(),
});

type FormValues = z.infer<typeof schema>;

interface SuggestShopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuggestShopDialog({ open, onOpenChange }: SuggestShopDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { shopName: "", mapsUrl: "", reason: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/suggest-shop`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify(values),
        }
      );
      if (!res.ok) throw new Error("Submission failed");
      toast.success("Thanks! We'll review your suggestion.");
      form.reset();
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Suggest a Coffee Shop</DialogTitle>
          <DialogDescription>
            Know a great indie spot? Let us know and we'll look into adding it.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="shopName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Monmouth Coffee" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mapsUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Maps URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://maps.google.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Why do you love it?{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Great espresso, cosy vibe, hidden gem..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Sending…" : "Send suggestion →"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
