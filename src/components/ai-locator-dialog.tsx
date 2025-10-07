"use client";

import { useState, type ReactNode, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { suggestLocatorAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";
import type { SuggestLocatorOutput } from "@/ai/flows/suggest-locator";

const aiFormSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
  html: z.string().min(10, { message: "Please provide a snippet of the element's HTML." }),
  pageSource: z.string().min(1, { message: "Page source cannot be empty." }),
});

interface AiLocatorDialogProps {
  children: ReactNode;
  onLocatorSuggested: (locator: Partial<{name: string, type: any, value: string}>) => void;
  defaults?: Partial<{ url: string; pageSource: string; html: string }>; // optional prefill
}

export function AiLocatorDialog({ children, onLocatorSuggested, defaults }: AiLocatorDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestLocatorOutput | null>(null);

  const form = useForm<z.infer<typeof aiFormSchema>>({
    resolver: zodResolver(aiFormSchema),
    defaultValues: {
      url: defaults?.url || "",
      html: defaults?.html || "",
      pageSource: defaults?.pageSource || "",
    },
  });

  useEffect(() => {
    if (defaults?.url || defaults?.pageSource || defaults?.html) {
      form.reset({
        url: defaults.url || form.getValues("url"),
        html: defaults.html || form.getValues("html"),
        pageSource: defaults.pageSource || form.getValues("pageSource"),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaults?.url, defaults?.pageSource, defaults?.html]);

  const onSubmit = async (values: z.infer<typeof aiFormSchema>) => {
    setIsLoading(true);
    setSuggestion(null);
    const result = await suggestLocatorAction(values);
    setIsLoading(false);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "AI Suggestion Failed",
        description: result.error,
      });
    } else if (result.data) {
        setSuggestion(result.data);
    }
  };
  
  const handleUseSuggestion = () => {
    if (suggestion) {
        onLocatorSuggested({
            type: suggestion.locatorType,
            value: suggestion.locator,
        });
        setIsOpen(false);
        setSuggestion(null);
        form.reset();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if(!open) {
            form.reset();
            setSuggestion(null);
        }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>AI Locator Suggestion</DialogTitle>
          <DialogDescription>
            Provide page details, and our AI will suggest the best locator for your element.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">AI is analyzing the page...</p>
            </div>
        ) : suggestion ? (
            <div className="space-y-4 py-4">
                 <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertTitle>Suggestion Ready!</AlertTitle>
                    <AlertDescription>
                        Here is the optimal locator suggested by our AI.
                    </AlertDescription>
                </Alert>
                <div className="space-y-2 rounded-lg border p-4">
                    <h3 className="font-semibold">Suggested Locator</h3>
                    <p className="font-code text-primary bg-primary/10 px-2 py-1 rounded-md inline-block">{suggestion.locator}</p>
                    <div className="flex items-center gap-4 text-sm pt-2">
                        <div>
                            <span className="text-muted-foreground">Type: </span>
                            <Badge variant="secondary">{suggestion.locatorType}</Badge>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Confidence: </span>
                            <Badge>{(suggestion.confidence * 100).toFixed(0)}%</Badge>
                        </div>
                    </div>
                     <p className="text-sm text-muted-foreground pt-2"><span className="font-semibold">Explanation:</span> {suggestion.explanation}</p>
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => setSuggestion(null)}>Try Again</Button>
                    <Button onClick={handleUseSuggestion}><CheckCircle className="mr-2 h-4 w-4"/> Use This Locator</Button>
                </DialogFooter>
            </div>
        ) : (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/login" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="html"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Element HTML</FormLabel>
                    <FormControl>
                      <Textarea placeholder='<button id="login-btn" class="btn btn-primary">Login</button>' {...field} rows={3} />
                    </FormControl>
                     <FormDescription>
                        Paste the HTML of the target element.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pageSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Page Source</FormLabel>
                    <FormControl>
                      <Textarea placeholder="<html>...</html>" {...field} rows={6}/>
                    </FormControl>
                    <FormDescription>
                        Paste the full HTML source of the page (Ctrl+U or Cmd+Opt+U).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                <Button type="submit">
                  <Sparkles className="mr-2 h-4 w-4" /> Get Suggestion
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
