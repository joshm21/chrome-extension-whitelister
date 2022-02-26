const SERVER_ENDPOINT = "your-server-endpoint-url"


const onOtherExtensionDisabledOrUninstalled = async (extensionInfo) => {
  if (extensionInfo.name == await getPartnerExtensionName()) {
    postToServer("disabledOrUninstalled")
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

const getPartnerExtensionName = () => {
  return new Promise(resolve => {
    chrome.management.getSelf(extensionInfo => {
      extensionInfo.name == "Whitelister" ? resolve("Whitelister Guard") : resolve("Whitelister")
    })
  })
}




chrome.management.onDisabled.addListener(onOtherExtensionDisabledOrUninstalled)