{
  const formElm = document.querySelector(".config__form");
  const [
    apiKeyInput,
    baseUriInput,
    appSecretInput,
  ] = document.getElementsByTagName("input");

  formElm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const res = await fetch("/configure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: apiKeyInput.value,
        baseUri: baseUriInput.value,
        appSecret: appSecretInput.value,
      }),
    });
    console.log(res);
  });
}
