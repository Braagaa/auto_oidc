{
  const formElm = document.querySelector("form");
  const [
    apiKeyInput,
    baseUriInput,
    appSecretInput,
  ] = document.getElementsByTagName("input");

  formElm.addEventListener("submit", (event) => {
    fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: apiKeyInput.value,
        baseUri: baseUriInput.value,
        appSecret: appSecretInput.value,
      }),
    });
  });
}
