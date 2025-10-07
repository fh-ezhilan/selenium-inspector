'use server';
/**
 * @fileOverview A flow that generates Selenium test methods in Java.
 *
 * - generateMethods - A function that generates Java methods based on a description.
 * - GenerateMethodsInput - The input type for the generateMethods function.
 * - GenerateMethodsOutput - The return type for the generateMethods function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, "");
}

const LocatorSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["id", "name", "className", "tagName", "linkText", "partialLinkText", "css", "xpath"]),
  value: z.string(),
});

const GenerateMethodsInputSchema = z.object({
  pageName: z.string().describe("The name of the page object class."),
  locators: z.array(LocatorSchema).describe("A list of available locators on the page."),
  description: z.string().describe("A natural language description of the test case or user interaction."),
});
export type GenerateMethodsInput = z.infer<typeof GenerateMethodsInputSchema>;

const GenerateMethodsOutputSchema = z.object({
  methods: z.string().describe("The generated Java methods as a single string. Each method should be well-documented."),
});
export type GenerateMethodsOutput = z.infer<typeof GenerateMethodsOutputSchema>;

export async function generateMethods(input: GenerateMethodsInput): Promise<GenerateMethodsOutput> {
  return generateMethodsFlow(input);
}

const PromptInputSchema = z.object({
  pageName: z.string(),
  locators: z.array(z.object({
    name: z.string(),
    camelCaseName: z.string(),
    type: z.string(),
    value: z.string()
  })),
  description: z.string(),
});

const prompt = ai.definePrompt({
  name: 'generateMethodsPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: GenerateMethodsOutputSchema},
  prompt: `You are an expert Selenium test automation engineer who writes clean, maintainable Java code.
Your task is to generate Java methods for a Page Object class based on a natural language description.

You will be given the Page Object class name, a list of available locators, and a description of the desired user interaction.

Rules:
1.  Generate one or more public void Java methods that perform the actions described.
2.  Use the provided locators. The locators are defined as static 'By' variables in the class. You must refer to them by their camelCased variable names.
3.  Assume a 'WebDriver driver' instance is available in the class scope. You should also assume the driver has been initialized.
4.  Each generated method should have a Javadoc comment explaining what it does.
5.  Do not include the class definition or the locator definitions in your output. Only generate the methods.
6.  If the description implies interacting with input fields, generate methods that accept string parameters (e.g., 'public void enterUsername(String username)').
7.  The generated code should be only the method(s), without any surrounding markdown or explanations.

Here is the context for the page object:
Page Object Class Name: {{{pageName}}}Page

Available Locators (use the camelCaseName for variable names):
{{#each locators}}
- Name: "{{this.name}}", camelCaseName: "{{this.camelCaseName}}", Type: {{this.type}}, Value: "{{this.value}}"
{{/each}}

User Interaction Description:
"{{{description}}}"

Now, generate the Java methods based on the description.
`,
});

const generateMethodsFlow = ai.defineFlow(
  {
    name: 'generateMethodsFlow',
    inputSchema: GenerateMethodsInputSchema,
    outputSchema: GenerateMethodsOutputSchema,
  },
  async (input) => {
    const processedLocators = input.locators.map(locator => ({
        ...locator,
        camelCaseName: toCamelCase(locator.name)
    }));

    const promptInput = {
      pageName: input.pageName,
      locators: processedLocators,
      description: input.description,
    };
    
    const {output} = await prompt(promptInput);
    return output!;
  }
);
