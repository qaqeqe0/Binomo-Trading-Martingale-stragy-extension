
import { Messages } from '../utils/messages'

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, Messages.TOGGLE_OVERLAY)
      }
    }
  )
});
