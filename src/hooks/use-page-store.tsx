"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import type { PageObject, Locator, TestData, TestCase, TestCaseStep } from "@/lib/types";

// Sample data to make the app feel alive from the start
const initialPages: PageObject[] = [
  {
    id: "login-page",
    name: "Login Page",
    locators: [
      { id: "1", name: "Username Field", type: "id", value: "username" },
      { id: "2", name: "Password Field", type: "id", value: "password" },
      { id: "3", name: "Login Button", type: "xpath", value: "//button[text()='Login']" },
    ],
    generatedMethods: `/**
 * Clicks the login button.
 */
public void clickLoginButton() {
    driver.findElement(loginButton).click();
}

/**
 * Enters the provided username.
 * @param username The username to enter.
 */
public void enterUsername(String username) {
    driver.findElement(usernameField).sendKeys(username);
}

/**
 * Enters the provided password.
 * @param password The password to enter.
 */
public void enterPassword(String password) {
    driver.findElement(passwordField).sendKeys(password);
}`
  },
  {
    id: "dashboard-page",
    name: "Dashboard",
    locators: [
      { id: "4", name: "Welcome Header", type: "css", value: "h1.dashboard-welcome" },
      { id: "5", name: "Logout Link", type: "linkText", value: "Logout" },
    ],
    generatedMethods: `/**
 * Returns the welcome message text.
 * @return The welcome message.
 */
public String getWelcomeMessage() {
    return driver.findElement(welcomeHeader).getText();
}

/**
 * Clicks the logout link.
 */
public void clickLogoutLink() {
    driver.findElement(logoutLink).click();
}`
  },
];

const initialTestData: TestData[] = [
    { id: 'data-1', key: 'Application URL', value: 'https://example.com', scope: 'global' },
    { id: 'data-2', key: 'Admin Username', value: 'admin', scope: 'global' },
    { id: 'data-3', key: 'Admin Password', value: 'password123', scope: 'global' },
    { id: 'data-4', key: 'Username', value: 'testuser', scope: 'login-page' },
];

const initialTestCases: TestCase[] = [
    {
        id: 'tc-1',
        name: 'Successful Login',
        steps: [
            { id: 'step-1-1', pageId: 'login-page', pageName: 'Login Page', methodName: 'enterUsername' },
            { id: 'step-1-2', pageId: 'login-page', pageName: 'Login Page', methodName: 'enterPassword' },
            { id: 'step-1-3', pageId: 'login-page', pageName: 'Login Page', methodName: 'clickLoginButton' },
        ]
    }
];

interface PagesContextType {
  pages: PageObject[];
  testData: TestData[];
  testCases: TestCase[];
  getPageById: (id: string) => PageObject | undefined;
  addPage: (name: string) => void;
  updatePageName: (id: string, newName: string) => void;
  deletePage: (id: string) => void;
  addLocator: (pageId: string, locator: Omit<Locator, "id">) => void;
  updateLocator: (pageId: string, locatorId: string, updates: Partial<Omit<Locator, "id">>) => void;
  deleteLocator: (pageId: string, locatorId: string) => void;
  updatePageMethods: (pageId: string, methods: string) => void;
  updatePageSource: (pageId: string, html: string) => void;
  updatePageUrl: (pageId: string, url: string) => void;
  addTestData: (data: Omit<TestData, "id">) => void;
  updateTestData: (id: string, updates: Partial<Omit<TestData, "id">>) => void;
  deleteTestData: (id: string) => void;
  addTestCase: (testCase: Omit<TestCase, "id">) => void;
  updateTestCase: (id: string, updates: Omit<TestCase, 'id'>) => void;
  deleteTestCase: (id: string) => void;
  saveTestCaseCode: (id: string, code: string) => void;
}

const PagesContext = createContext<PagesContextType | undefined>(undefined);

export function PagesProvider({ children }: { children: ReactNode }) {
  // LocalStorage keys
  const PAGES_KEY = 'sie_pages_v1';
  const TESTDATA_KEY = 'sie_testdata_v1';
  const TESTCASES_KEY = 'sie_testcases_v1';

  // Hydrate from localStorage if available; otherwise fall back to initial seed
  const [pages, setPages] = useState<PageObject[]>(() => {
    if (typeof window === 'undefined') return initialPages;
    try {
      const raw = window.localStorage.getItem(PAGES_KEY);
      return raw ? (JSON.parse(raw) as PageObject[]) : initialPages;
    } catch {
      return initialPages;
    }
  });
  const [testData, setTestData] = useState<TestData[]>(() => {
    if (typeof window === 'undefined') return initialTestData;
    try {
      const raw = window.localStorage.getItem(TESTDATA_KEY);
      return raw ? (JSON.parse(raw) as TestData[]) : initialTestData;
    } catch {
      return initialTestData;
    }
  });
  const [testCases, setTestCases] = useState<TestCase[]>(() => {
    if (typeof window === 'undefined') return initialTestCases;
    try {
      const raw = window.localStorage.getItem(TESTCASES_KEY);
      return raw ? (JSON.parse(raw) as TestCase[]) : initialTestCases;
    } catch {
      return initialTestCases;
    }
  });

  // Persist to localStorage on any change
  useEffect(() => {
    try { window.localStorage.setItem(PAGES_KEY, JSON.stringify(pages)); } catch {}
  }, [pages]);
  useEffect(() => {
    try { window.localStorage.setItem(TESTDATA_KEY, JSON.stringify(testData)); } catch {}
  }, [testData]);
  useEffect(() => {
    try { window.localStorage.setItem(TESTCASES_KEY, JSON.stringify(testCases)); } catch {}
  }, [testCases]);

  const getPageById = useCallback((id: string) => pages.find(p => p.id === id), [pages]);

  const addPage = (name: string) => {
    const newPage: PageObject = {
      id: name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
      name,
      locators: [],
      generatedMethods: "",
    };
    setPages(prev => [...prev, newPage]);
  };

  const updatePageName = (id: string, newName: string) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
  }

  const deletePage = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
  }

  const addLocator = (pageId: string, locator: Omit<Locator, "id">) => {
    const newLocator: Locator = { ...locator, id: Date.now().toString() };
    setPages(prev => prev.map(p => 
      p.id === pageId 
        ? { ...p, locators: [...p.locators, newLocator] }
        : p
    ));
  };

  const updateLocator = (pageId: string, locatorId: string, updates: Partial<Omit<Locator, "id">>) => {
    setPages(prev => prev.map(p => 
      p.id === pageId
        ? { ...p, locators: p.locators.map(l => l.id === locatorId ? { ...l, ...updates } : l) }
        : p
    ));
  };

  const deleteLocator = (pageId: string, locatorId: string) => {
    setPages(prev => prev.map(p => 
      p.id === pageId
        ? { ...p, locators: p.locators.filter(l => l.id !== locatorId) }
        : p
    ));
  };

  const updatePageMethods = (pageId: string, methods: string) => {
    setPages(prev => prev.map(p => 
        p.id === pageId ? { ...p, generatedMethods: methods } : p
    ));
  }

  const updatePageSource = (pageId: string, html: string) => {
    setPages(prev => prev.map(p => 
        p.id === pageId ? { ...p, pageSource: html } : p
    ));
  }

  const updatePageUrl = (pageId: string, url: string) => {
    setPages(prev => prev.map(p => 
        p.id === pageId ? { ...p, pageUrl: url } : p
    ));
  }

  const addTestData = (data: Omit<TestData, "id">) => {
    const newTestData: TestData = { ...data, id: Date.now().toString() };
    setTestData(prev => [...prev, newTestData]);
  };

  const updateTestData = (id: string, updates: Partial<Omit<TestData, "id">>) => {
    setTestData(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteTestData = (id: string) => {
    setTestData(prev => prev.filter(d => d.id !== id));
  };
  
  const addTestCase = (testCase: Omit<TestCase, "id">) => {
    const newTestCase: TestCase = { ...testCase, id: `tc-${Date.now()}` };
    setTestCases(prev => [...prev, newTestCase]);
  }

  const updateTestCase = (id: string, updates: Omit<TestCase, 'id'>) => {
    setTestCases(prev => prev.map(tc => (
      tc.id === id
        ? { id, ...updates }
        : tc
    )));
  }

  const saveTestCaseCode = (id: string, code: string) => {
    setTestCases(prev => prev.map(tc => (
      tc.id === id ? { ...tc, generatedCode: code } : tc
    )));
  }

  const deleteTestCase = (id: string) => {
    setTestCases(prev => prev.filter(tc => tc.id !== id));
  }

  const value = {
    pages,
    testData,
    testCases,
    getPageById,
    addPage,
    updatePageName,
    deletePage,
    addLocator,
    updateLocator,
    deleteLocator,
    updatePageMethods,
    updatePageSource,
    updatePageUrl,
    addTestData,
    updateTestData,
    deleteTestData,
    addTestCase,
    updateTestCase,
    deleteTestCase,
    saveTestCaseCode,
  };

  return <PagesContext.Provider value={value}>{children}</PagesContext.Provider>;
}

export function usePages() {
  const context = useContext(PagesContext);
  if (context === undefined) {
    throw new Error("usePages must be used within a PagesProvider");
  }
  return context;
}
