// Kiểu dữ liệu cho WebElement.
type WebElement = HTMLElement;

// Hàm chờ cho đến khi một phần tử xuất hiện trong DOM với một thời gian tối đa.
async function waitForElement(selector: string, timeout: number = 5000): Promise<WebElement> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const element = await findElement(selector);
    if (element) {
      return element;
    }
    await sleep(200); // Chờ 200ms trước khi kiểm tra lại.
  }
  throw new Error(`Element '${selector}' not found within ${timeout}ms.`);
}

function waitForValue(expectedValue: any, inputElement: HTMLInputElement, timeout: number = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (inputElement.value === String(expectedValue)) {
        clearInterval(interval);
        resolve(true);
      }

      const currentTime = Date.now();
      if (currentTime - startTime >= timeout) {
        clearInterval(interval);
        resolve(false);
      }
    }, 100);
  });
}

// Hàm chờ cho đến khi một phần tử biến mất khỏi DOM với một thời gian tối đa.
async function waitForElementToDisappear(selector: string, timeout: number = 5000): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const element = await findElement(selector);
    if (!element) {
      return;
    }
    await sleep(200); // Chờ 200ms trước khi kiểm tra lại.
  }
  throw new Error(`Element '${selector}' is still present after ${timeout}ms.`);
}

// Hàm chờ cho đến khi một phần tử được tải lên trong DOM với một thời gian tối đa.
async function waitForElementToBeLoaded(selector: string, timeout: number = 5000): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const element = await findElement(selector);
    if (element && isElementLoaded(element)) {
      return;
    }
    await sleep(200); // Chờ 200ms trước khi kiểm tra lại.
  }
  throw new Error(`Element '${selector}' is not fully loaded within ${timeout}ms.`);
}

// Hàm tìm kiếm phần tử DOM bằng cách sử dụng các bộ chọn tương tự như CSS.
async function findElement(selector: string): Promise<WebElement | null> {
  const element = document.querySelector(selector);
  if (element instanceof HTMLElement) {
    return element;
  }
  return null;
}

// Hàm tìm kiếm tất cả các phần tử DOM phù hợp với bộ chọn tương tự như CSS.
async function findElements(selector: string): Promise<NodeListOf<WebElement>> {
  return document.querySelectorAll(selector);
}

// Kiểm tra xem phần tử có được tải hoàn toàn hay chưa.
function isElementLoaded(element: HTMLElement): boolean {
  return element.offsetWidth > 0 && element.offsetHeight > 0;
}

// Hàm chờ một khoảng thời gian nhất định.
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export {
    waitForElement,
    waitForValue,
    waitForElementToDisappear,
    waitForElementToBeLoaded,
    findElements,
    isElementLoaded,
    sleep
}

export default findElement;