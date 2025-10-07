export type LocatorType = "id" | "name" | "className" | "tagName" | "linkText" | "partialLinkText" | "css" | "xpath";

export interface Locator {
  id: string;
  name: string;
  type: LocatorType;
  value: string;
}

export interface PageObject {
  id: string;
  name: string;
  locators: Locator[];
  generatedMethods?: string;
  pageSource?: string; // optional saved HTML of the page
  pageUrl?: string; // optional canonical URL of the page
}

export interface TestData {
  id: string;
  key: string;
  value: string;
  scope: 'global' | string; // 'global' or a pageId
}

export interface TestCaseStep {
    id: string;
    pageId: string;
    pageName: string;
    methodName: string;
}

export interface TestCase {
  id:string;
  name: string;
  steps: TestCaseStep[];
  generatedCode?: string;
}
