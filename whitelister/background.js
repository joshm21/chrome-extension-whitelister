const SERVER_ENDPOINT = ""
const MINUTES_UNTIL_NEXT_ALARM = 0.1



const checkIncognitoAccessAllowed = () => {
  chrome.extension.isAllowedIncognitoAccess(isAllowedAccess => {
    if (!isAllowedAccess) {
      postToServer({ event: "incognitoAccessDisallowed" })
    }
  })
}

const onOtherExtensionDisabledOrUninstalled = async (extensionInfo) => {
  const thisName = await getExtensionName()
  const otherName = extensionInfo.name
  if (`${thisName} Guard` == otherName || thisName == `${otherName} Guard`) {
    postToServer({ event: "partnerExtensionDisabledOrUninstalled" })
  }
}

const postToServer = async (payload) => {
  payload.timestamp = new Date().toISOString()
  payload.userEmail = await getUserEmail()
  payload.source = await getExtensionName()
  fetch(SERVER_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({ payload }),
    headers: { "Content-Type": "text/plain;charset=utf-8" }
  })
}




const getUserEmail = async () => {
  return new Promise(resolve => {
    chrome.identity.getProfileUserInfo(profileUserInfo => resolve(profileUserInfo.email))
  })
}

const getExtensionName = async () => {
  return new Promise(resolve => {
    chrome.management.getSelf(extensionInfo => resolve(extensionInfo.name))
  })
}



chrome.management.onDisabled.addListener(onOtherExtensionDisabledOrUninstalled)
chrome.alarms.onAlarm.addListener(checkIncognitoAccessAllowed)
chrome.alarms.create({ delayInMinutes: 0.1 }) // asap
