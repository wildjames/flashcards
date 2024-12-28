/*******************************************************
 * Constants & Globals
 *******************************************************/
const DEV_URL = "http://localhost:3000";
const PROD_URL = "https://wildjames.com";

// How many minutes to wait before opening a new tab again
const WAIT_MINUTES = 1;

// the last time that we opened a new tab
let lastOpenTime = 0;

// Current devMode state
let isDevMode = false;

/*******************************************************/

function loadDevModeFromStorage() {
  chrome.storage.sync.get(["devMode"], (result) => {
    isDevMode = !!result.devMode;
    console.log("Dev mode is now:", isDevMode);
  });
}

function openNewTab() {
  const targetUrl = isDevMode ? DEV_URL : PROD_URL;
  chrome.tabs.create({ url: targetUrl }, (createdTab) => {
    // Chrome automatically switches to the newly created tab
    console.log("Opened new tab:", targetUrl);
  });
}

/*******************************************************
 * Listen for changes to devMode in storage
 * (so toggling in the popup is immediate)
 *******************************************************/
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && changes.devMode) {
    isDevMode = changes.devMode.newValue;
    console.log("Dev mode changed to:", isDevMode);
  }
});

/*******************************************************
 * Core logic:
 *  - Wait WAIT_MINUTES since lastOpenTime
 *  - Then, on URL changes, open a new tab
 *******************************************************/
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // We only care about real page navigations (i.e., when the URL is updated)
  if (changeInfo.url && !changeInfo.url.startsWith("chrome://")) {
    const now = Date.now();

    // Check if enough time has passed since we last opened a tab
    if (now - lastOpenTime >= WAIT_MINUTES * 60 * 1000) {
      openNewTab();
      lastOpenTime = now;
    }
  }
});

/*******************************************************
 * Initialize:
 *  Load devMode from storage
 *  Set lastOpenTime to 'now' so we wait a full interval
 *******************************************************/
chrome.runtime.onInstalled.addListener(() => {
  loadDevModeFromStorage();
  lastOpenTime = Date.now();
});

chrome.runtime.onStartup.addListener(() => {
  loadDevModeFromStorage();
  lastOpenTime = Date.now();
});

// Also load devMode right away in case the extension is reloaded manually
loadDevModeFromStorage();
lastOpenTime = Date.now();
