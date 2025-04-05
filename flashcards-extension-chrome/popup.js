document.addEventListener("DOMContentLoaded", async () => {
    const devModeCheckbox = document.getElementById("devModeCheckbox");

    // Get the current devMode value from storage
    chrome.storage.sync.get(["devMode"], (result) => {
      const isDevMode = !!result.devMode;
      devModeCheckbox.checked = isDevMode;
    });

    // When the checkbox changes, update storage
    devModeCheckbox.addEventListener("change", () => {
      const newDevModeValue = devModeCheckbox.checked;
      chrome.storage.sync.set({ devMode: newDevModeValue }, () => {
        console.log("Dev mode set to", newDevModeValue);
      });
    });
  });
