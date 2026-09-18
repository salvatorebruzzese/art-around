const synth = window.speechSynthesis
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition
const SpeechRecognitionEvent =
  window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent

export function speechSynthesizer(inputTextElement) {
  const inputTextContent = inputTextElement.textContent

  const utterance = new SpeechSynthesisUtterance(inputTextContent)
  utterance.lang = 'it-IT'

  synth.speak(utterance)
}

export function speechRecognizer(startButton) {
  const recognition = new SpeechRecognition()

  recognition.lang = 'it-IT'
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  startButton.onclick = (status) => {
    if (!status) {
      recognition.start()
      // Change the icon to a stop icon
    } else recognition.abort()
  }
}
