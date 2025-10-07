import { TestTubeDiagonal } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <TestTubeDiagonal className="h-6 w-6 text-primary" />
      <h1 className="text-lg font-bold font-headline text-foreground">
        Selenium IDE
        <span className="text-primary">Enhanced</span>
      </h1>
    </div>
  );
}
