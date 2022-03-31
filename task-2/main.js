const p = document.querySelector("p");
let count = 0;

p.textContent = count;

const intervalId = setInterval(function incrementOrCancel() {
  if (count >= 12) {
    return clearInterval(intervalId);
  }
  p.textContent = ++count;
}, 1_000);
