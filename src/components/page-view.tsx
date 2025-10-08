"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Copy, Edit, PlusCircle, Trash2, Bot, Loader2, Sparkles } from "lucide-react";

import type { PageObject, Locator, LocatorType } from "@/lib/types";
import { usePages } from "@/hooks/use-page-store";
import { generateJavaCode } from "@/lib/code-generator";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AiLocatorDialog } from "./ai-locator-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Textarea } from "./ui/textarea";
import { generateMethodsAction } from "@/lib/actions";


const locatorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["id", "name", "className", "tagName", "linkText", "partialLinkText", "css", "xpath"]),
  value: z.string().min(1, "Value is required"),
});

const locatorTypes: LocatorType[] = ["id", "name", "className", "tagName", "linkText", "partialLinkText", "css", "xpath"];

interface PageViewProps {
  page: PageObject;
}

export function PageView({ page }: PageViewProps) {
  const { addLocator, updateLocator, deleteLocator, updatePageMethods, updatePageSource, updatePageUrl } = usePages();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocator, setEditingLocator] = useState<Locator | null>(null);

  const [testCaseDescription, setTestCaseDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [fullCode, setFullCode] = useState(generateJavaCode(page));

  useEffect(() => {
    setFullCode(generateJavaCode(page, page.generatedMethods));
  }, [page, page.generatedMethods]);

  const form = useForm<z.infer<typeof locatorSchema>>({
    resolver: zodResolver(locatorSchema),
    defaultValues: {
      name: "",
      type: "id",
      value: "",
    },
  });

  const handleGenerateMethods = async () => {
    if (!testCaseDescription.trim()) return;
    setIsGenerating(true);
    const result = await generateMethodsAction({
      pageName: page.name,
      locators: page.locators,
      description: testCaseDescription,
    });
    setIsGenerating(false);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Method Generation Failed",
        description: result.error,
      });
    } else if (result.data) {
      const newMethods = page.generatedMethods
        ? `${page.generatedMethods}\n\n${result.data.methods}` 
        : result.data.methods;
      updatePageMethods(page.id, newMethods);
      toast({
        title: "Methods Generated!",
        description: "AI has added new methods to your page object.",
      });
    }
  };

  const handleOpenDialog = (locator: Locator | null = null) => {
    setEditingLocator(locator);
    if (locator) {
      form.reset({ name: locator.name, type: locator.type, value: locator.value });
    } else {
      form.reset({ name: "", type: "id", value: "" });
    }
    setIsDialogOpen(true);
  };
  
  const handleSetSuggestedLocator = (locator: Partial<z.infer<typeof locatorSchema>>) => {
    form.reset(locator);
    setIsDialogOpen(true);
  }

  const onSubmit = (values: z.infer<typeof locatorSchema>) => {
    if (editingLocator) {
      updateLocator(page.id, editingLocator.id, values);
      toast({ title: "Locator Updated", description: "The locator has been successfully updated." });
    } else {
      addLocator(page.id, values);
      toast({ title: "Locator Added", description: "The new locator has been successfully added." });
    }
    setIsDialogOpen(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullCode);
    toast({ title: "Code Copied!", description: "The Java code has been copied to your clipboard." });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold font-headline tracking-tight">{page.name}</h2>
      </div>

      <Tabs defaultValue="locators" className="space-y-4">
          <TabsList>
          <TabsTrigger value="locators" className="data-[state=active]:bg-highlight data-[state=active]:text-highlight-foreground">Locators</TabsTrigger>
          <TabsTrigger value="code" className="data-[state=active]:bg-highlight data-[state=active]:text-highlight-foreground">Generated Code</TabsTrigger>
            <TabsTrigger value="source" className="data-[state=active]:bg-highlight data-[state=active]:text-highlight-foreground">Page Source</TabsTrigger>
        </TabsList>

        <TabsContent value="locators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Locator Management</CardTitle>
              <CardDescription>
                Add, edit, or delete locators for the {page.name}.
              </CardDescription>
              <div className="flex items-center gap-2 pt-2">
                <Button onClick={() => handleOpenDialog()}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Locator
                </Button>
                <AiLocatorDialog
                  onLocatorSuggested={handleSetSuggestedLocator}
                  defaults={{
                    url: page.pageUrl || ((typeof window !== 'undefined' ? window.location.origin : '') + `/pages/${page.id}`),
                    pageSource: page.pageSource,
                  }}
                >
                    <Button variant="outline">
                        <Bot className="mr-2 h-4 w-4" /> Suggest with AI
                    </Button>
                </AiLocatorDialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {page.locators.map((locator) => (
                    <TableRow key={locator.id}>
                      <TableCell className="font-medium">{locator.name}</TableCell>
                      <TableCell><Badge variant="secondary">{locator.type}</Badge></TableCell>
                      <TableCell className="font-code">{locator.value}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(locator)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Delete Locator?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the locator "{locator.name}".
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteLocator(page.id, locator.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Selenium Java Code</CardTitle>
              <CardDescription>
                Edit the generated Java Page Object class below. Changes are saved to this page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Textarea
                  rows={22}
                  className="font-code text-sm whitespace-pre leading-5"
                  value={fullCode}
                  onChange={(e) => setFullCode(e.target.value)}
                  onBlur={() => updatePageMethods(page.id, fullCode)}
                />
                <Button onClick={() => { updatePageMethods(page.id, fullCode); }} size="sm" variant="secondary" className="absolute top-2 right-24">Save</Button>
                <Button onClick={copyToClipboard} size="sm" variant="outline" className="absolute top-2 right-2">
                    <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
              </div>
            </CardContent>
            <CardContent>
                <div className="border-t pt-6">
                    <div className="flex items-center gap-2 mb-1">
                        <Bot className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Generate Methods with AI</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Describe a user interaction, and AI will add the corresponding Java methods into the editable code above.
                    </p>
                    <div className="space-y-4">
                        <Textarea
                            placeholder="e.g., The user enters their username and password, then clicks the login button."
                            value={testCaseDescription}
                            onChange={(e) => setTestCaseDescription(e.target.value)}
                            rows={4}
                            disabled={isGenerating}
                        />
                        <Button onClick={handleGenerateMethods} disabled={isGenerating || !testCaseDescription.trim()}>
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            {isGenerating ? "Generating..." : "Generate & Add Methods"}
                        </Button>
                    </div>
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="source" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stored Page Source (HTML)</CardTitle>
              <CardDescription>
                Paste the full HTML of this page and its canonical URL. They will auto-fill in the AI Locator dialog.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Page URL</label>
                  <Input
                    placeholder="https://example.com/login"
                    defaultValue={page.pageUrl || ""}
                    onBlur={(e) => updatePageUrl(page.id, e.currentTarget.value)}
                  />
                </div>
                <Textarea
                  rows={16}
                  placeholder="<html>...</html>"
                  defaultValue={page.pageSource || ""}
                  onBlur={(e) => updatePageSource(page.id, e.currentTarget.value)}
                />
                <p className="text-xs text-muted-foreground">Tip: use Ctrl+U (Cmd+Opt+U on Mac) to view and copy a page’s source.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLocator ? "Edit Locator" : "Add New Locator"}</DialogTitle>
            <DialogDescription>
              Provide the details for your element locator.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Locator Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Submit Button" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Locator Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a locator type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locatorTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Locator Value</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., //button[@id='submit']" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
