const apiEndpoint = "https://api.thecatapi.com/v1/images/search";

const image = document.querySelector("img");

async function fetchCatImage() {
  const response = await fetch(apiEndpoint);
  const data = await response.json();
  return data;
}

async function handleClick() {
  const catImage = await fetchCatImage();
  const imageSrc = catImage[0].url;
  image.src = imageSrc;
}

window.addEventListener("load", handleClick, { once: true });

(function creatingButtons() {
  const button = document.createElement("button");
  button.textContent = "Fetch a new cat!";
  button.addEventListener("click", handleClick);
  document.body.appendChild(button);
})();
