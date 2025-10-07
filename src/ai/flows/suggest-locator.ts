// src/ai/flows/suggest-locator.ts
'use server';
/**
 * @fileOverview A flow that suggests the best locator for a given element on a webpage.
 *
 * - suggestLocator - A function that suggests the best locator for a given element.
 * - SuggestLocatorInput - The input type for the suggestLocator function.
 * - SuggestLocatorOutput - The return type for the suggestLocator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestLocatorInputSchema = z.object({
  html: z.string().describe('The HTML of the element to find a locator for.'),
  pageSource: z.string().describe('The full HTML source code of the page.'),
  url: z.string().url().describe('The URL of the page.'),
});
export type SuggestLocatorInput = z.infer<typeof SuggestLocatorInputSchema>;

const SuggestLocatorOutputSchema = z.object({
  locator: z.string().describe('The suggested locator for the element.'),
  locatorType: z.enum(['xpath', 'css', 'id']).describe('The type of the suggested locator.'),
  confidence: z.number().min(0).max(1).describe('The confidence score for the suggested locator.'),
  explanation: z.string().describe('An explanation of why the suggested locator was chosen.'),
});
export type SuggestLocatorOutput = z.infer<typeof SuggestLocatorOutputSchema>;

export async function suggestLocator(input: SuggestLocatorInput): Promise<SuggestLocatorOutput> {
  return suggestLocatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestLocatorPrompt',
  input: {schema: SuggestLocatorInputSchema},
  output: {schema: SuggestLocatorOutputSchema},
  prompt: `You are an AI expert in suggesting the best locator for a given element on a webpage.

You are given the HTML of the element, the full HTML source code of the page, and the URL of the page.

You should suggest the best locator (XPath, CSS, or ID) for the element, and explain why you chose that locator.

Be sure to include a confidence score for your suggestion.

Element HTML: {{{html}}}
Page Source: {{{pageSource}}}
URL: {{{url}}}`,
});

const suggestLocatorFlow = ai.defineFlow(
  {
    name: 'suggestLocatorFlow',
    inputSchema: SuggestLocatorInputSchema,
    outputSchema: SuggestLocatorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
