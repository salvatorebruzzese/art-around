const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
const NativeSpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null

export function startSpeechSynthesis(inputTextContent) {
  if (!synth) return
  const utterance = new SpeechSynthesisUtterance(inputTextContent)
  utterance.lang = 'it-IT'
  synth.speak(utterance)
}

let pipelinePromise = null
function loadAsrPipeline() {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      // Import dinamico da CDN ESM: nessun pacchetto npm richiesto
      const { pipeline } =
        await import('https://esm.sh/@huggingface/transformers@3.0.0')
      return pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny')
    })()
  }
  return pipelinePromise
}

class InBrowserSpeechRecognition {
  constructor() {
    this.lang = 'it-IT'
    this.interimResults = false
    this.maxAlternatives = 1
    this.onresult = null
    this.onerror = null
    this.onend = null

    this.mediaRecorder = null
    this.stream = null
    this.audioChunks = []
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.audioChunks = []
      this.mediaRecorder = new MediaRecorder(this.stream)

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        this._cleanup()
        await this._transcribe(audioBlob)
        if (typeof this.onend === 'function') this.onend()
      }

      this.mediaRecorder.start()
    } catch (err) {
      if (typeof this.onerror === 'function') this.onerror(err)
      if (typeof this.onend === 'function') this.onend()
    }
  }

  abort() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop()
    } else {
      this._cleanup()
      if (typeof this.onend === 'function') this.onend()
    }
  }

  stop() {
    this.abort()
  }

  _cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }
  }

  async _transcribe(blob) {
    try {
      const arrayBuffer = await blob.arrayBuffer()
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000,
      })
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
      const audioData = audioBuffer.getChannelData(0)
      await audioCtx.close()

      const transcriber = await loadAsrPipeline()
      const result = await transcriber(audioData, {
        language: 'italian',
        task: 'transcribe',
      })

      const transcript = (result.text || '').trim()

      if (typeof this.onresult === 'function') {
        this.onresult({
          results: [[{ transcript }]],
        })
      }
    } catch (err) {
      if (typeof this.onerror === 'function') this.onerror(err)
    }
  }
}

export function speechRecognizer() {
  if (NativeSpeechRecognition) {
    const recognition = new NativeSpeechRecognition()
    recognition.lang = 'it-IT'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    return recognition
  }

  if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
    return new InBrowserSpeechRecognition()
  }

  return null
}
