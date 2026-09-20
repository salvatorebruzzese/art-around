const synth = window.speechSynthesis
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition
const SpeechRecognitionEvent =
  window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent

export function speechSynthesizer(inputTextContent) {
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
    } else recognition.abort()
  }
}
