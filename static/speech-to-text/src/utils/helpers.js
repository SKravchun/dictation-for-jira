export function firstSymbol(str) {
  if (!str) return str;
  return str[0].toUpperCase() + str.slice(1);
}

export const select = () => {
  return window.getSelection().toString()
}

function handleFocus(textareaInput) {
  textareaInput.current.focus()
}

export const handleListing = (setIsListening, SpeechRecognition, listening) => {
  if (listening) {
    setIsListening(false);
    SpeechRecognition.stopListening();
  } else {
    setIsListening(true);
    SpeechRecognition.startListening({
      continuous: true,
    });
  }
  handleFocus()
};

export const handleReset = (resetTranscript, setArea) => {
  resetTranscript();
  setArea('')
};

export function changeSelectedText(text, setArea, area) {
  setArea(area.replace(select(), ` ${text} `))
}
