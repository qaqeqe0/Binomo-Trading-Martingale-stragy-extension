import React, { useEffect, useRef, useState, useCallback } from 'react'
import ReactDOM from 'react-dom'

import { Card, Button, Typography, Box, CardContent, CardActions } from '@mui/material'

import { Messages } from '../utils/messages'
import waitForNextMinuteStart, { observeElement } from '../utils/features'
import findElement, {
  waitForElement,
  waitForElementToDisappear,
  waitForElementToBeLoaded,
  findElements,
  isElementLoaded,
  sleep
} from '../utils/queryDOM'

import './contentScript.css'

type BUTTON_ELEMENT = {
  CALL: HTMLElement | null,
  PUT: HTMLElement | null
}

enum ACTION_BUTTON {
  CALL = "CALL",
  PUT = "PUT",
  START = "START",
  STOP = "STOP"
}

type ID_TIMEOUT = {
  current: NodeJS.Timeout
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOMContentLoaded")
});

const App: React.FC<{}> = () => {
  // const [options, setOptions] = useState<LocalStorageOptions | null>(null)
  const [isActive, setIsActive] = useState<boolean>(false)
  const [isStart, setIsStart] = useState<boolean>(false)
  const [isStop, setIsStop] = useState<boolean>(true)
  const [action, setAction] = useState<string>("")
  const [counter, setCounter] = useState<number>(0);
  const idTimeout = useRef<NodeJS.Timeout>()
  const idSetTimeout = useRef<NodeJS.Timeout>()
  const callBtn: HTMLElement | null = document.getElementById("qa_trading_dealUpButton");
  const putBtn: HTMLElement | null = document.getElementById("qa_trading_dealDownButton");
  const historyEle: HTMLElement | null = document.querySelector("#qa_historyButton")
  let toastWinEle: HTMLElement | null = document.querySelector("main.ng-star-inserted div.option.win")
  let toastLossEle: HTMLElement | null = document.querySelector("main.ng-star-inserted div.option")
  let toastContainer: HTMLElement | null = document.querySelector("div.toast-container")

  const handleMessages = (msg: Messages) => {
    if (msg === Messages.TOGGLE_OVERLAY) {
      setIsActive(!isActive)
    }
  }

  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleMessages)
    return () => chrome.runtime.onMessage.removeListener(handleMessages)
  }, [isActive])

  const bull = (
    <Box
      component="span"
      sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}
    >
      •
    </Box>
  );

  useEffect(() => {
    console.log(`${isStart} - ${action} - ${callBtn}`)
    if (isStart && (action === ACTION_BUTTON.CALL || action === ACTION_BUTTON.PUT)) {
      const now = new Date();
      const nextMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0, 0);
      const delay = nextMinute.getTime() - now.getTime();

      idTimeout.current = setTimeout(() => {
        if (action === ACTION_BUTTON.CALL && callBtn) {
          callBtn.click()
          setCounter(counter + 1)
        } else if (action === ACTION_BUTTON.PUT && putBtn) {
          putBtn.click()
          setCounter(counter + 1)
        }
      }, delay);

      if (counter % 5 === 0 && historyEle) {
        historyEle.click()
        idSetTimeout.current = setTimeout(() => historyEle.click(), 1000)
      }

    }

    return () => {
      console.log("Counter is number", counter)
      console.log("Clear time out...", idTimeout.current)
      idTimeout.current && clearTimeout(idTimeout.current as NodeJS.Timeout)
      idSetTimeout.current && clearTimeout(idSetTimeout.current as NodeJS.Timeout)
    }
  }, [counter])

  useEffect(() => {
    if (isStop) {
      idTimeout.current && clearTimeout(idTimeout.current as NodeJS.Timeout)
      setCounter(0)
      setAction("")
    }
  }, [isStop])

  useEffect(() => {
    if (isStart) {
      const targetElement: HTMLElement | null = document.querySelector("main.ng-star-inserted")
      const callbackFunction = () => {
        toastLossEle = document.querySelector("main.ng-star-inserted div.option.win")
          || document.querySelector("main.ng-star-inserted div.option")
        // Xử lý khi phần tử xuất hiện hoặc biến mất
        const isTargetNodeInDOM = targetElement.contains(toastLossEle);
        if (isTargetNodeInDOM) {
          console.log('Phần tử đã xuất hiện', toastLossEle.getAttribute("class"));
        } else {
          console.log('Phần tử đã biến mất');
        }
      };

      // Bắt đầu theo dõi sự thay đổi của targetElement
      const observer = observeElement(targetElement, callbackFunction);
      console.log(observer);

    }
  }, [isStart])

  const handleCallButtonClick = useCallback(() => {
    console.log(ACTION_BUTTON.CALL)
    setAction(ACTION_BUTTON.CALL);
    setIsStart(() => true);
    setIsStop(() => false);
    setCounter(counter => counter + 1)
  }, [])

  const handlePutButtonClick = useCallback(() => {
    console.log(ACTION_BUTTON.PUT)
    setAction(ACTION_BUTTON.PUT);
    setIsStart(() => true);
    setIsStop(() => false);
    setCounter(counter => counter + 1)
  }, []);

  const handleStartButtonClick = useCallback(() => {
    setIsStart(true);
    setIsStop(!isStart);
  }, []);

  const handleStopButtonClick = useCallback(() => {
    console.log(ACTION_BUTTON.STOP)
    setIsStart(() => false);
    // setIsStop(() => true);
    setCounter(() => 0)
    setAction(() => "");
  }, []);



  return (
    <>
      {isActive && (
        <Card className="overlayCard" sx={{ minWidth: 275 }}>
          <CardContent>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
              Word of the Day
            </Typography>
            <Typography variant="h5" component="div">
              be{bull}nev{bull}o{bull}lent
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              adjective
            </Typography>
            <Typography variant="body2">
              well meaning and kindly.
              <br />
              {'"a benevolent smile"'}
            </Typography>
          </CardContent>
          <CardActions>
            <Button variant="contained" size="small" color="success"
              onClick={handleCallButtonClick}
            >{ACTION_BUTTON.CALL}</Button>{' '}
            <Button variant="contained" size="small" color="error"
              onClick={handlePutButtonClick}
            >{ACTION_BUTTON.PUT}</Button>
            <Button variant="contained" size="small" color="error"
              onClick={handleStopButtonClick}
            >{ACTION_BUTTON.STOP}</Button>
          </CardActions>
        </Card>
      )}
    </>
  )
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(<App />, root)

