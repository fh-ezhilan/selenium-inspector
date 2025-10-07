"use client";

import { usePages } from "@/hooks/use-page-store";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageView } from "@/components/page-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function PageDetails() {
  const params = useParams();
  const router = useRouter();
  const { getPageById } = usePages();

  const pageId = Array.isArray(params.pageId) ? params.pageId[0] : params.pageId;
  const page = getPageById(pageId);

  useEffect(() => {
    if (!page && pageId) {
      // Allow a moment for the store to hydrate before redirecting
      const timer = setTimeout(() => {
        if (!getPageById(pageId)) {
          // router.push('/404'); // Or a custom not-found page
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [page, pageId, getPageById, router]);

  if (!page) {
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-1/3" />
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  return <PageView page={page} />;
}
