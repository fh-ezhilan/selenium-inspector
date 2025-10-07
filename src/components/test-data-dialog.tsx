"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { usePages } from "@/hooks/use-page-store";
import { useToast } from "@/hooks/use-toast";
import type { TestData } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

const testDataSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
  scope: z.string().min(1, "Scope is required"),
});

interface TestDataDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  testData: TestData | null;
}

export function TestDataDialog({ isOpen, setIsOpen, testData }: TestDataDialogProps) {
  const { pages, addTestData, updateTestData } = usePages();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof testDataSchema>>({
    resolver: zodResolver(testDataSchema),
    defaultValues: {
      key: "",
      value: "",
      scope: "global",
    },
  });

  useEffect(() => {
    if (isOpen) {
        if (testData) {
        form.reset({
            key: testData.key,
            value: testData.value,
            scope: testData.scope,
        });
        } else {
        form.reset({
            key: "",
            value: "",
            scope: "global",
        });
        }
    }
  }, [testData, isOpen, form]);

  const onSubmit = (values: z.infer<typeof testDataSchema>) => {
    if (testData) {
      updateTestData(testData.id, values);
      toast({ title: "Test Data Updated", description: "The test data has been successfully updated." });
    } else {
      addTestData(values);
      toast({ title: "Test Data Added", description: "The new test data has been successfully added." });
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{testData ? "Edit Test Data" : "Add New Test Data"}</DialogTitle>
          <DialogDescription>
            Provide the details for your test data variable.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., test_user_1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scope</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a scope" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="global">Global (All Pages)</SelectItem>
                      {pages.map(page => (
                        <SelectItem key={page.id} value={page.id}>{page.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
