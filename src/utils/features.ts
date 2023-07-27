// Hàm chờ đến giây thứ 0 của phút mới
function waitForNextMinuteStart(callback: () => void) {
  const now = new Date();
  const nextMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0, 0);
  const delay = nextMinute.getTime() - now.getTime();

  setTimeout(callback, delay);
}

// Hàm thực hiện lệnh giao dịch
// function executeTradingLogic() {
//     // Đặt điều kiện và thực hiện lệnh giao dịch tại đây
//     // Ví dụ: nếu bạn muốn lên thì gọi hàm buy(), nếu bạn muốn xuống thì gọi hàm sell()
//     // buy();
//     // sell();
//     console.log("Executing trading logic...");
// }

// Hàm chờ đến giây thứ 0 của mỗi phút và thực hiện lệnh giao dịch
// function startTrading() {
//     waitForNextMinuteStart(() => {
//         executeTradingLogic();
//         startTrading(); // Tiếp tục thực hiện lệnh giao dịch sau mỗi phút
//     });
// }

function convertCurrencyStringToNumber(currencyString: string): number {
  // Loại bỏ ký tự "₫" và các dấu ","
  const cleanedString = currencyString.replace(/₫|,/g, '');

  // Chuyển đổi chuỗi thành số và trả về kết quả
  return parseFloat(cleanedString);
}

function convertPercentageStringToNumber(percentageString: string): number {
  // Loại bỏ ký tự "%"
  const cleanedString = percentageString.replace('%', '');

  // Chuyển đổi chuỗi thành số và trả về kết quả
  return parseFloat(cleanedString);
}

// Hàm tính số tiền đặt cược của lệnh tiếp theo để lấy lại vốn và có lãi bằng số tiền của lệnh đầu tiên
function calculateNextBetAmount(losses: number[], initialBetAmount: number, profitPercentage: number = 0.85): number {
  // Tính tổng số tiền thua của các lệnh trước đó
  const totalLosses = losses.reduce((sum, loss) => sum + loss, 0);

  // Tính số tiền của lệnh đầu tiên
  const firstBetAmount = initialBetAmount;

  // Tính số tiền đặt cược của lệnh tiếp theo
  const nextBetAmount = (firstBetAmount + totalLosses) / profitPercentage;

  return nextBetAmount;
}

const balance = 150
const firstBetAmount = 2
const losses = [firstBetAmount];
const calculateNextBet = (): any => {
  const nextBetAmount = calculateNextBetAmount(losses, firstBetAmount);
  if (balance <= nextBetAmount) {
    console.log(losses)
    return
  }

  losses.push(Math.floor(+nextBetAmount))
  calculateNextBet()
}


// Ví dụ: Giả sử lệnh đầu tiên đặt cược $10 và đã thua
// const firstBalance = 2500000
// const firstBetAmount = 23000
// const losses = [firstBetAmount];

// Tính số tiền đặt cược của lệnh tiếp theo để lấy lại vốn và có lãi bằng số tiền của lệnh đầu tiên
// const nextBetAmount = calculateNextBetAmount(losses, firstBetAmount);
// console.log("Next bet amount:", nextBetAmount); // Kết quả sẽ là số tiền đặt cược của lệnh tiếp theo để lấy lại vốn và có lãi bằng số tiền của lệnh đầu tiên

// Lấy đối tượng input từ DOM
// const inputElement = document.querySelector("#amount-counter input") as HTMLInputElement;

// Hàm để thay đổi giá trị của input và kích hoạt sự kiện input
function changeInputValue(inputElement: HTMLInputElement, newValue: string | number) {
  inputElement.value = String(newValue);
  const inputEvent = new Event("input", { bubbles: true });
  inputElement.dispatchEvent(inputEvent);
}

// Sử dụng hàm changeInputValue để thay đổi giá trị của input
// const newValue = "4000000";
// changeInputValue(newValue);

// Tạo một hàm để theo dõi sự thay đổi trong DOM
const observeElement = (targetNode: HTMLElement, callback: Function) => {
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        // Kiểm tra nếu targetNode hoặc các phần tử con của nó đã xuất hiện hoặc biến mất
        callback();
      }
    }
  });

  // Cấu hình để theo dõi các thay đổi trong DOM
  const config = { childList: true, subtree: true };

  // Bắt đầu theo dõi
  observer.observe(targetNode, config);

  // Trả về đối tượng observer để có thể dừng việc theo dõi sau này nếu cần
  return observer;
};

// Sử dụng hàm observeElement để theo dõi sự xuất hiện và biến mất của một phần tử
// const targetElement = document.getElementById('your-target-element-id');

// const callbackFunction = () => {
//   // Xử lý khi phần tử xuất hiện hoặc biến mất
//   if (targetElement && targetElement.style.display === 'none') {
//     console.log('Phần tử đã biến mất');
//   } else if (targetElement) {
//     console.log('Phần tử đã xuất hiện');
//   }
// };

// Bắt đầu theo dõi sự thay đổi của targetElement
// const observer = observeElement(targetElement, callbackFunction);

// Để dừng việc theo dõi sau khi không cần nữa, bạn có thể gọi:
// observer.disconnect();

// const observeElement = (targetNode: HTMLElement, callback: Function) => {
//   const observer = new MutationObserver((mutationsList) => {
//     for (const mutation of mutationsList) {
//       if (mutation.type === 'childList') {
//         // Kiểm tra xem phần tử đang được theo dõi có trong DOM hay không
//         const isTargetNodeInDOM = document.body.contains(targetNode);

//         // Xử lý khi phần tử xuất hiện hoặc biến mất
//         if (isTargetNodeInDOM) {
//           console.log('Phần tử đã xuất hiện');
//         } else {
//           console.log('Phần tử đã biến mất');
//         }

//         // Gọi hàm callback để xử lý sự kiện
//         callback(isTargetNodeInDOM);
//       }
//     }
//   });

//   const config = { childList: true, subtree: true };
//   observer.observe(targetNode.parentNode, config);

//   return observer;
// };

const getDelayTime = (): number => {
  const now: Date = new Date();
  const nextMinute: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0, 0);
  const delay: number = nextMinute.getTime() - now.getTime();

  return delay
}

const getSecondsNow = (): number => {
  const now: Date = new Date();
  const seconds: number = now.getSeconds();
  return seconds
}

export {
  calculateNextBetAmount,
  convertPercentageStringToNumber,
  convertCurrencyStringToNumber,
  changeInputValue,
  observeElement,
  getDelayTime,
  getSecondsNow
}
export default waitForNextMinuteStart;