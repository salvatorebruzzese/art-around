const synth = window.speechSynthesis
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition
const SpeechRecognitionEvent =
  window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent

// Function to let synthesizer speak some text content
export function startSpeechSynthesis(inputTextContent) {
  const utterance = new SpeechSynthesisUtterance(inputTextContent)
  utterance.lang = 'it-IT'

  synth.speak(utterance)
}

// Function that returns the object to start recognition
export function speechRecognizer() {
  const recognition = new SpeechRecognition()

  recognition.lang = 'it-IT'
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  return recognition
}
