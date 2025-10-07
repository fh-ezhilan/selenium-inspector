"use server";

import { suggestLocator, SuggestLocatorInput, SuggestLocatorOutput } from "@/ai/flows/suggest-locator";
import { generateMethods, GenerateMethodsInput, GenerateMethodsOutput } from "@/ai/flows/generate-methods";
import { z } from "zod";

const suggestLocatorActionSchema = z.object({
  html: z.string(),
  pageSource: z.string(),
  url: z.string().url(),
});

export async function suggestLocatorAction(input: SuggestLocatorInput): Promise<{
    data?: SuggestLocatorOutput;
    error?: string;
}> {
  const parsed = suggestLocatorActionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid input." };
  }

  try {
    const output = await suggestLocator(parsed.data);
    return { data: output };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return { error: `AI suggestion failed: ${errorMessage}` };
  }
}

const locatorActionSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["id", "name", "className", "tagName", "linkText", "partialLinkText", "css", "xpath"]),
    value: z.string(),
});
  
const generateMethodsActionSchema = z.object({
    pageName: z.string(),
    locators: z.array(locatorActionSchema),
    description: z.string(),
});

export async function generateMethodsAction(input: GenerateMethodsInput): Promise<{
    data?: GenerateMethodsOutput;
    error?: string;
}> {
  const parsed = generateMethodsActionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: `Invalid input: ${parsed.error.message}` };
  }

  try {
    const output = await generateMethods(parsed.data);
    return { data: output };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return { error: `AI method generation failed: ${errorMessage}` };
  }
}
