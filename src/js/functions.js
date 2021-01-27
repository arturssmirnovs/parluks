// Context Menu Functions
const { clipboard } = require("electron");

const getText = el => {
  if (
    el.tagName === "TEXTAREA" ||
    el.tagName === "INPUT" ||
    el.type === "text"
  ) {
    return el.value.substring(el.selectionStart, el.selectionEnd);
  }
  return null;
};

const copyText = txt => {
  clipboard.writeText(txt, "clipboard");
};

const cutText = (txt, el) => {
  clipboard.writeText(txt, "clipboard");
  el.value = "";
};

const pasteText = el => {
  const pastedText = clipboard.readText();
  el.value = pastedText;
};

const deleteText = el => {
  el.value = "";
};

module.exports = {
  getText,
  copyText,
  cutText,
  pasteText,
  deleteText,
};
