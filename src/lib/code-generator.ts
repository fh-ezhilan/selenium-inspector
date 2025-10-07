import type { PageObject, Locator } from "./types";

function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, "");
}

function getByMethod(type: string): string {
  switch(type) {
    case 'id': return 'By.id';
    case 'name': return 'By.name';
    case 'className': return 'By.className';
    case 'tagName': return 'By.tagName';
    case 'linkText': return 'By.linkText';
    case 'partialLinkText': return 'By.partialLinkText';
    case 'css': return 'By.cssSelector';
    case 'xpath': return 'By.xpath';
    default: return 'By.xpath';
  }
}

export function generateJavaCode(page: PageObject, extraMethods: string | null = null): string {
  const className = page.name.replace(/\s+/g, "") + "Page";

  const locatorsCode = page.locators
    .map(
      (locator: Locator) =>
        `    public static final By ${toCamelCase(locator.name)} = ${getByMethod(locator.type)}("${locator.value.replace(/"/g, '\\"')}");`
    )
    .join("\n");

  const methodsPlaceholder = `
    // Add methods to interact with the elements here
    // For example:
    /*
    public void clickLoginButton() {
        driver.findElement(loginButton).click();
    }
    */`;
    
  const methodsCode = extraMethods ? `\n${extraMethods}` : methodsPlaceholder;

  return `
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class ${className} {

    private WebDriver driver;

    public ${className}(WebDriver driver) {
        this.driver = driver;
    }

    // Locators for ${page.name}
${locatorsCode}
${methodsCode}
}
`.trim();
}
