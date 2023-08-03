import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import ReactDOM from 'react-dom'

import { Card, Button, Typography, Box, CardContent, CardActions } from '@mui/material'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import StopIcon from '@mui/icons-material/Stop';
import { Messages } from '../utils/messages'
import waitForNextMinuteStart,
{
  getDelayTime,
  getSecondsNow,
  convertPercentageStringToNumber,
  changeInputValue,
  calculateNextBetAmount,
  convertCurrencyStringToNumber,
  observeElement
} from '../utils/features'
import findElement, {
  waitForElement,
  waitForValue,
  waitForElementToDisappear,
  waitForElementToBeLoaded,
  sleep,
  findElements
} from '../utils/queryDOM'

import './contentScript.css'

type BUTTON_ELEMENT = "CALL" | "PUT" | "STOP" | "START"

enum ACTION_BUTTON {
  CALL = "CALL",
  PUT = "PUT",
  START = "START",
  STOP = "STOP"
}
type WebElement = HTMLElement | null

const App: React.FC<{}> = () => {
  const callBtn = useRef<WebElement>(document.getElementById("qa_trading_dealUpButton"))
  const putBtn = useRef<WebElement>(document.getElementById("qa_trading_dealDownButton"))
  const historyEle = useRef<WebElement>(document.querySelector("#qa_historyButton"))
  const procent = useRef<WebElement>(document.querySelector("button.btn span.procent"))
  const symbolTitle = useRef<WebElement>(document.querySelector("button.btn span.title"))
  const inputAmount = useRef<HTMLInputElement>(document.querySelector("#amount-counter input"))

  const isWin = useRef<boolean>()
  const counter = useRef<number>(0)
  const isStopped = useRef<boolean>(false)
  // let betAmounts: number[] = [23000, 54118, 117785, 256357, 557953, 1214367]

  const newBetAmouts = (firstBetAmount: number, profitPercentage: number) => {
    const qaTradingBalance = document.getElementById("qa_trading_balance")
    const balance: number = qaTradingBalance ? convertCurrencyStringToNumber(qaTradingBalance.textContent.trim()) : 0
    // const firstBetAmount: number = betAmounts[0]
    // const losses = [firstBetAmount];
    // const firstBetAmount: number = 2300000
    const losses = [firstBetAmount];
    const calculateNextBet = (): any => {
      const nextBetAmount = calculateNextBetAmount(losses, firstBetAmount, profitPercentage);
      if (balance <= nextBetAmount) {
        console.log("New Bet Amounts:", losses)
        return
      }

      losses.push(Math.floor(+nextBetAmount))
      calculateNextBet()
    }
    calculateNextBet()
    return losses
  }

  const profitPercent: number = convertPercentageStringToNumber(procent.current.textContent.trim())
  // betAmounts = profitPercent !== 85 ? newBetAmouts(profitPercent/100) : betAmounts
  const betAmounts = newBetAmouts(23000, profitPercent / 100) ?? [23000, 54118, 117785, 256357, 557953, 1214367]

  // Hide balance number
  const balanceEle = document.getElementById("qa_trading_balance")
  if (balanceEle) balanceEle.style.display = "none"

  useEffect(() => {
    const targetElement: HTMLElement | null = document.querySelector("vui-sidebar.hydrated")
    const callbackFunction = () => {
      const historyEle: WebElement | null = document.querySelector("div.sidebar_open__1WEhL")
      // Xử lý khi phần tử xuất hiện hoặc biến mất
      const isTargetNodeInDOM = targetElement.contains(historyEle);
      if (isTargetNodeInDOM) {
        // Hide result element
        const resultsEle: NodeListOf<HTMLElement> = document.querySelectorAll(".result .font-regular-m.offset-row-sm-2xs")
        resultsEle && resultsEle.forEach(ele => ele.style.display = "none")
        console.log('Results History đã xuất hiện');
      } else {
        console.log('Results History đã biến mất');
      }
    };
  
    // Bắt đầu theo dõi sự thay đổi của targetElement
    const observer = observeElement(targetElement, callbackFunction);
    console.log(observer);
  }, [])

  const handleScollBet = async (ACTION: BUTTON_ELEMENT) => {
    let loseCounter: number = 0
    let winCounter: number = 0
    if (isStopped.current) {
      console.log("Stopped")
      return
    }
    console.log(`Action ${ACTION} is Starting...`)
    changeInputValue(inputAmount.current, "")
    changeInputValue(inputAmount.current, betAmounts[0])

    let btnAction: WebElement = null
    if (ACTION === ACTION_BUTTON.CALL) btnAction = callBtn.current
    else btnAction = putBtn.current
    let seconds: number = new Date().getSeconds();
    seconds >= 30 && await sleep(getDelayTime())
    try {
      while (!isStopped.current) {
        if (isStopped.current) {
          console.log("71 - Stopped")
          return
        }
        if (btnAction) {
          changeInputValue(inputAmount.current, "")
          changeInputValue(inputAmount.current, betAmounts[loseCounter])
          const isMatched: boolean = await waitForValue(betAmounts[loseCounter], inputAmount.current)
          isMatched && console.log("Next Amount is", betAmounts[loseCounter])
          if (!isMatched) break;
          btnAction.click()
          console.log(`Action ${ACTION} is Started with Amount is ${inputAmount.current.value}`)
          // changeInputValue(inputAmount.current, "")
          const progressBarItem: WebElement = await waitForElement("app-progress-bar.ng-star-inserted div.progress-bar progress-bar-item")
          !progressBarItem && btnAction.click()
          await sleep(getDelayTime())
          ++counter.current
          await waitForElementToBeLoaded("main.ng-star-inserted div.option", 65000)
          const toastLose = await findElement("main.ng-star-inserted div.option")
          const toastWin = await findElement("main.ng-star-inserted div.option.win")

          if (toastLose) {
            if (toastWin) {
              loseCounter = 0
              isWin.current = true
              ++winCounter

              console.log("Win", +winCounter)
            } else {
              winCounter = 0
              isWin.current = false
              ++loseCounter
              console.log("Lose", +loseCounter)
              if (loseCounter >= betAmounts.length) {
                console.log(`Limited has ${loseCounter}. Stoped!`)
                break;
              }
            }

            // changeInputValue(inputAmount.current, "")
            // changeInputValue(inputAmount.current, betAmounts[loseCounter])
            // const isMatched: boolean = await waitForValue(betAmounts[loseCounter], inputAmount.current)
            // isMatched && console.log("Next Amount is", betAmounts[loseCounter])
            // if (!isMatched) break;
          } else {
              console.log("toastLose", toastLose)
          }

          if (counter.current % 5 === 0 && historyEle) {
            historyEle.current.click()
            await waitForElement("div.sidebar_open__1WEhL")
            historyEle.current.click()
            await waitForElementToDisappear("div.sidebar_open__1WEhL")
          }

          if (isStopped.current) {
            console.log("112 - Stopped!")
            return
          }

        } else {
          callBtn.current = document.getElementById("qa_trading_dealUpButton")
        }
      }
    } catch (error) {
      console.log(error)
    }

  }

  const handleCallButtonClick = useCallback(async () => {
    try {
      isStopped.current = false
      counter.current = 0
      await handleScollBet(ACTION_BUTTON.CALL)
    } catch (error) {
      console.log(error)
    }
  }, [])

  const handlePutButtonClick = useCallback(async () => {
    try {
      isStopped.current = false
      counter.current = 0
      await handleScollBet(ACTION_BUTTON.PUT)
    } catch (error) {
      console.log(error)
    }
  }, []);

  const handleStopButtonClick = useCallback(() => {
    isStopped.current = true
    console.log("Stopping...")
  }, []);

  return (
    <Card className="overlayCard" sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant='subtitle1' gutterBottom sx={{ textAlign: 'center' }}>
          {symbolTitle.current && symbolTitle.current.textContent}
        </Typography>
        <Typography variant='h3' component="h3" gutterBottom sx={{ textAlign: 'center', marginBottom: '0' }}>
          {procent.current && procent.current.textContent}
        </Typography>
      </CardContent>
      <CardActions>
        <Button variant="contained" size="large" color="success" startIcon={<ArrowUpwardIcon />}
          onClick={handleCallButtonClick}
        >{ACTION_BUTTON.CALL}</Button>{' '}
        <Button variant="contained" size="large" color="error" startIcon={<ArrowDownwardIcon />}
          onClick={handlePutButtonClick}
        >{ACTION_BUTTON.PUT}</Button>
        <Button variant="contained" size="large" color="primary" startIcon={<StopIcon />}
          onClick={handleStopButtonClick}
        >{ACTION_BUTTON.STOP}</Button>
      </CardActions>
    </Card>
  )
}
chrome.runtime.onMessage.addListener((msg: Messages) => {
  if (msg === Messages.TOGGLE_OVERLAY) {
    const root = document.createElement('div')
    document.body.appendChild(root)
    ReactDOM.render(<App />, root)
  }
})

