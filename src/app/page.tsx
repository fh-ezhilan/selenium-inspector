import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TestTubeDiagonal } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <TestTubeDiagonal className="h-8 w-8" />
          </div>
          <CardTitle className="mt-4 text-2xl font-headline">
            Welcome to Selenium IDE Enhanced
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            To get started, create a new page using the button in the sidebar, or select an existing one to manage its locators.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
