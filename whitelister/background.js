const SERVER_ENDPOINT = "your_server_endpoint_url"
const MINUTES_UNTIL_RECHECK_INCOGNITO = 0.1


const onOtherExtensionDisabledOrUninstalled = async (extensionInfo) => {
  if (extensionInfo.name == await getPartnerExtensionName()) {
    postToServer("disabledOrUninstalled")
  }
}

const checkIncognitoAccessAllowed = async (alarm) => {
  chrome.alarms.create({ delayInMinutes: MINUTES_UNTIL_RECHECK_INCOGNITO })
  if (!(await isAllowedIncognitoAccess())) {
    postToServer("incognitoAccessDisallowed")
  }
}

const postToServer = async (event) => {
  const userEmail = await getUserEmail()
  fetch(SERVER_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      userEmail,
      event
    }),
    headers: { "Content-Type": "text/plain;charset=utf-8" }
  })
}




const getUserEmail = async () => {
  return new Promise(resolve => {
    chrome.identity.getProfileUserInfo(profileUserInfo => resolve(profileUserInfo.email))
  })
}

const isAllowedIncognitoAccess = async () => {
  return new Promise(resolve => {
    chrome.extension.isAllowedIncognitoAccess(isAllowedAccess => resolve(isAllowedAccess))
  })
}

const getPartnerExtensionName = () => {
  return new Promise(resolve => {
    chrome.management.getSelf(extensionInfo => {
      extensionInfo.name == "Whitelister" ? resolve("Whitelister Guard") : resolve("Whitelister")
    })
  })
}




chrome.management.onDisabled.addListener(onOtherExtensionDisabledOrUninstalled)
chrome.alarms.onAlarm.addListener(checkIncognitoAccessAllowed)
chrome.alarms.create({ delayInMinutes: 0.1 }) // asap