"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePages } from "@/hooks/use-page-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FilePlus, FileText, Trash2, Database, Edit, PlusCircle, FileCode2, Pencil } from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  sidebarMenuButtonVariants,
} from "@/components/ui/sidebar";
import { Logo } from "./logo";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import type { TestData } from "@/lib/types";
import { TestDataDialog } from "./test-data-dialog";

export function SidebarNav() {
  const { pages, addPage, deletePage, testData, deleteTestData, updatePageName } = usePages();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [openNewPageDialog, setOpenNewPageDialog] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [editingTestData, setEditingTestData] = useState<TestData | null>(null);
  const [isTestDataDialogOpen, setIsTestDataDialogOpen] = useState(false);
  const [renamingPageId, setRenamingPageId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const handleCreatePage = () => {
    if (newPageName.trim()) {
      addPage(newPageName.trim());
      toast({
        title: "Page Created",
        description: `Successfully created the "${newPageName.trim()}" page.`,
      });
      setNewPageName("");
      setOpenNewPageDialog(false);
    }
  };

  const handleDeletePage = (e: React.MouseEvent, pageId: string, pageName: string) => {
    e.preventDefault();
    e.stopPropagation();
    deletePage(pageId);
    toast({
        title: "Page Deleted",
        description: `Successfully deleted the "${pageName}" page.`,
        variant: 'destructive'
    });
    if (pathname === `/pages/${pageId}`) {
        router.push('/');
    }
  }

  const handleOpenTestDataDialog = (data: TestData | null = null) => {
    setEditingTestData(data);
    setIsTestDataDialogOpen(true);
  };

  const handleDeleteTestData = (e: React.MouseEvent, testDataId: string, key: string) => {
      e.preventDefault();
      e.stopPropagation();
      deleteTestData(testDataId);
      toast({
          title: "Test Data Deleted",
          description: `Successfully deleted the "${key}" data item.`,
          variant: "destructive",
      });
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent className="p-0">
          <Accordion type="multiple" defaultValue={["object-repo", "test-data"]} className="w-full px-2 space-y-1">
            <AccordionItem value="object-repo" className="border-none">
              <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:no-underline hover:text-foreground py-2 px-2 rounded-md">
                  <div className="flex items-center gap-2">
                      <FileCode2 className="h-4 w-4" />
                      <span>Object Repo</span>
                  </div>
              </AccordionTrigger>
              <AccordionContent className="pt-1 pl-2">
                  <SidebarMenu>
                  {pages.map((page) => (
                    <SidebarMenuItem key={page.id} className="group/item">
                      <Link
                        href={`/pages/${page.id}`}
                        data-active={pathname === `/pages/${page.id}`}
                        className={cn(sidebarMenuButtonVariants({ variant: 'default', size: 'sm' }))}
                      >
                          <FileText />
                          <span>{page.name}</span>
                      </Link>
                        <Dialog open={renamingPageId === page.id} onOpenChange={(open) => { if(!open) setRenamingPageId(null); }}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="absolute right-9 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover/item:opacity-100" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setRenamingPageId(page.id); setRenameValue(page.name); }}>
                                   <Pencil className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Rename Page</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="rename-page" className="text-right">New Name</Label>
                                        <Input id="rename-page" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} className="col-span-3" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={() => { if(renameValue.trim()){ updatePageName(page.id, renameValue.trim()); setRenamingPageId(null); toast({ title: "Page Renamed", description: `Page is now "${renameValue.trim()}".`}); } }}>Save</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover/item:opacity-100">
                                   <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the page
                                     <span className="font-bold"> {page.name} </span> 
                                     and all of its locators.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={(e) => handleDeletePage(e, page.id, page.name)}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
                <Dialog open={openNewPageDialog} onOpenChange={setOpenNewPageDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="mt-2 w-full">
                        <FilePlus className="mr-2 h-4 w-4" />
                        New Page
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Page</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="page-name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="page-name"
                            value={newPageName}
                            onChange={(e) => setNewPageName(e.target.value)}
                            className="col-span-3"
                            placeholder="e.g., Checkout Page"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={handleCreatePage}>
                          Create
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="test-data" className="border-none">
                <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:no-underline hover:text-foreground py-2 px-2 rounded-md">
                    <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        <span>Test Data</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1">
                    <div className="flex flex-col gap-1 pl-4 text-sm text-foreground">
                         {testData.map(data => (
                            <div key={data.id} className="group/data-item relative flex items-center justify-between pr-2 h-8">
                                <span className="truncate" title={data.key}>{data.key}</span>
                                <div className="flex items-center opacity-0 group-hover/data-item:opacity-100">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenTestDataDialog(data)}>
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <Trash2 className="h-3 w-3 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Test Data?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete the test data item "{data.key}".
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={(e) => handleDeleteTestData(e, data.id, data.key)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => handleOpenTestDataDialog(null)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Data
                        </Button>
                    </div>
                </AccordionContent>
            </AccordionItem>
          </Accordion>
        </SidebarContent>
      </Sidebar>
      <TestDataDialog
        isOpen={isTestDataDialogOpen}
        setIsOpen={setIsTestDataDialogOpen}
        testData={editingTestData}
      />
    </>
  );
}
