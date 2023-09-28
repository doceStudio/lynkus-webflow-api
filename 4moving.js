const memberCards = document.querySelectorAll('[data="memberCard"]');
const memberPopups = document.querySelectorAll('[data="memberPopup"]');
const popupWrap = document.querySelector(".aboutus-popup-container");
const links = document.querySelectorAll(".founders__link");

const getCorrespPopup = (card) => {
  const cardId = card.getAttribute("memberName");
  const correspPopup = document.querySelector(
    `[data="memberPopup"][memberName="${cardId}"]`
  );
  return correspPopup;
};

const checkBoxSize = (popup) => {
  const p = popup.querySelector(".popup_bio");
  const w = popup.querySelector(".popup_bio-wraper");
  console.Console(p, w);
  const pHeight = p.clientHeight();
  const wHeight = w.clientHeight();
  pHeight > wHeight
    ? w.classList.add("overflow-y-scroll")
    : w.classList.remove("overflow-y-scroll");
};

const enablePopup = (popup) => {
  if (!popupWrap.classList.contains("is-active"))
    popupWrap.classList.add("is-active");
  popup.classList.add("is-active");
  popupWrap.addEventListener("click", closePopups);
};

const closePopups = (event) => {
  if (event.target.closest(".popup__cross")) {
    popupWrap.classList.remove("is-active");
    for (popup of memberPopups) {
      popup.classList.remove("is-active");
    }
    popupWrap.removeEventListener("click", closePopups);
  }

  if (
    event.target.closest(".founders__link") ||
    event.target.closest(".popup_wrap")
  ) {
    return;
  }
  popupWrap.classList.remove("is-active");
  for (popup of memberPopups) {
    popup.classList.remove("is-active");
  }
  popupWrap.removeEventListener("click", closePopups);
};

const cardClickHandler = (event) => {
  if (event.target.closest(".founders__link")) {
    return;
  }
  const clickedCard = event.target.closest('[data="memberCard"]');

  for (popup of memberPopups) {
    popup.classList.remove("is-active");
  }
  const popupToEnable = getCorrespPopup(clickedCard);
  enablePopup(popupToEnable);
};

const init = () => {
  for (const card of memberCards) {
    card.addEventListener("click", cardClickHandler);
    // const correspPopup = getCorrespPopup(card);
    // checkParagraphSize(correspPopup);
  }
};

init();
