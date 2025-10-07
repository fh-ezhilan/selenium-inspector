
"use client";

import { useState } from "react";
import { usePages } from "@/hooks/use-page-store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, FileText, Trash2 } from "lucide-react";
import { CreateTestCaseDialog } from "./create-test-case-dialog";
import type { TestCase } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function TestCasesPane() {
    const { testCases, deleteTestCase } = usePages();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);

    const handleOpenDialog = (tc: TestCase | null) => {
        setSelectedTestCase(tc);
        setIsDialogOpen(true);
    };

    const handleDelete = (e: React.MouseEvent, tc: TestCase) => {
        e.stopPropagation();
        deleteTestCase(tc.id);
        toast({
            title: "Test Case Deleted",
            description: `Successfully deleted the test case "${tc.name}".`,
            variant: "destructive",
        });
    };

    return (
        <>
            <aside className="w-[350px] border-l bg-background p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold font-headline">Test Cases</h2>
                    <Button onClick={() => handleOpenDialog(null)} size="sm">
                        <PlusCircle className="mr-2 h-4 w-4"/> New Test Case
                    </Button>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto -mr-4 pr-4">
                    {testCases.map((tc) => (
                        <Card key={tc.id} className="cursor-pointer hover:bg-muted/50 group/tc relative" onClick={() => handleOpenDialog(tc)}>
                            <CardHeader className="p-3 pr-8">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <span className="truncate">{tc.name}</span>
                                </CardTitle>
                                <CardDescription className="pt-1 text-xs">
                                    {tc.steps.length} step{tc.steps.length === 1 ? '' : 's'}
                                </CardDescription>
                            </CardHeader>
                             <div className="absolute top-1/2 -translate-y-1/2 right-1 flex items-center opacity-0 group-hover/tc:opacity-100">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-destructive"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Test Case?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete the test case "{tc.name}".
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={(e) => handleDelete(e, tc)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </Card>
                    ))}
                    {testCases.length === 0 && (
                         <div className="text-center text-sm text-muted-foreground py-10 border rounded-lg border-dashed">
                            <p className="font-semibold">No Test Cases Yet</p>
                            <p className="mt-1">Click "New Test Case" to create one.</p>
                         </div>
                    )}
                </div>
            </aside>
            <CreateTestCaseDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} testCase={selectedTestCase} />
        </>
    );
}
