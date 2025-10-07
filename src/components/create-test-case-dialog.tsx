
"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usePages } from "@/hooks/use-page-store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { TestCase } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, PlusCircle, Trash2 } from "lucide-react";


const testCaseStepSchema = z.object({
  method: z.string({
    required_error: "Please select a method.",
  }).min(1, "Please select a method."),
});

const testCaseFormSchema = z.object({
  name: z.string().min(1, "Test case name is required."),
  steps: z.array(testCaseStepSchema).min(1, "A test case must have at least one step."),
});

type TestCaseFormValues = z.infer<typeof testCaseFormSchema>;

interface CreateTestCaseDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    testCase: TestCase | null;
}

export function CreateTestCaseDialog({ isOpen, setIsOpen, testCase }: CreateTestCaseDialogProps) {
    const { pages, addTestCase, updateTestCase } = usePages();
    const { toast } = useToast();
    const [popoverStates, setPopoverStates] = useState<Record<number, boolean>>({});

    const isEditMode = !!testCase;

    const form = useForm<TestCaseFormValues>({
        resolver: zodResolver(testCaseFormSchema),
        defaultValues: {
            name: "",
            steps: [{ method: "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "steps",
    });

    const availableMethods = useMemo(() => {
        const allMethods: { label: string; value: string }[] = [];
        const methodRegex = /public\s+void\s+([a-zA-Z0-9_]+)\s*\([^)]*\)/g;

        pages.forEach(page => {
            if (page.generatedMethods) {
                let match;
                while ((match = methodRegex.exec(page.generatedMethods)) !== null) {
                    const methodName = match[1];
                    allMethods.push({
                        label: `${page.name}: ${methodName}`,
                        value: `${page.id}::${page.name}::${methodName}`,
                    });
                }
            }
        });
        return allMethods;
    }, [pages]);

    const onSubmit = (data: TestCaseFormValues) => {
        const testCaseData = {
            name: data.name,
            steps: data.steps.map((step, index) => {
                const [pageId, pageName, methodName] = step.method.split('::');
                return { id: `step-${Date.now()}-${index}`, pageId, pageName, methodName };
            }),
        };
        
        if (isEditMode) {
            updateTestCase(testCase.id, testCaseData);
            toast({
                title: "Test Case Updated",
                description: `Successfully updated "${data.name}".`,
            });
        } else {
            addTestCase(testCaseData);
            toast({
                title: "Test Case Created",
                description: `Successfully created "${data.name}".`,
            });
        }
        setIsOpen(false);
    };

    useEffect(() => {
        if (isOpen) {
            if (testCase) {
                form.reset({
                    name: testCase.name,
                    steps: testCase.steps.map(step => ({
                        method: `${step.pageId}::${step.pageName}::${step.methodName}`
                    }))
                });
            } else {
                form.reset({
                    name: "",
                    steps: [{ method: "" }],
                });
            }
            setPopoverStates({});
        }
    }, [isOpen, testCase, form]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit Test Case" : "Create New Test Case"}</DialogTitle>
                    <DialogDescription>
                        {isEditMode 
                            ? "Modify the details of your test case."
                            : "Assemble your test case by adding method steps in the desired order."
                        }
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Test Case Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Successful Login Flow" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            <FormLabel>Test Steps</FormLabel>
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-muted-foreground">{index + 1}.</span>
                                    <FormField
                                        control={form.control}
                                        name={`steps.${index}.method`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormControl>
                                                  <div>
                                                    <Select
                                                      value={field.value}
                                                      onValueChange={(val) => {
                                                        form.setValue(`steps.${index}.method`, val, {
                                                          shouldDirty: true,
                                                          shouldTouch: true,
                                                          shouldValidate: true,
                                                        });
                                                      }}
                                                    >
                                                      <SelectTrigger>
                                                        <SelectValue placeholder="Select method" />
                                                      </SelectTrigger>
                                                      <SelectContent className="max-h-72 overflow-auto">
                                                        {availableMethods.map((method) => (
                                                          <SelectItem key={method.value} value={method.value}>
                                                            {method.label}
                                                          </SelectItem>
                                                        ))}
                                                      </SelectContent>
                                                    </Select>
                                                  </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive shrink-0"
                                        onClick={() => remove(index)}
                                        disabled={fields.length <= 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                             <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ method: "" })}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Step
                            </Button>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="ghost">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">{isEditMode ? "Save Changes" : "Create Test Case"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
