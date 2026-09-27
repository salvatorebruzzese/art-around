// utils/tourControllers.js

export class TourController {
  constructor({ itemNav = [], onChange = null } = {}) {
    this.itemNav = Array.isArray(itemNav) ? itemNav.slice() : []
    this.curItemIdx = 0
    this.detachedStack = []
    this.onChange = onChange
  }

  setItemNav(itemNav) {
    this.itemNav = Array.isArray(itemNav) ? itemNav.slice() : []
    this.curItemIdx = 0
    this.detachedStack = []
    this.emit()
  }

  getCurrentItemId() {
    if (this.detachedStack.length > 0) {
      return this.detachedStack[this.detachedStack.length - 1]
    }
    return this.itemNav[this.curItemIdx] || null
  }

  emit() {
    if (typeof this.onChange === 'function') {
      this.onChange({
        curItemIdx: this.curItemIdx,
        detachedStack: this.detachedStack.slice(),
      })
    }
  }

  goPrev() {
    if (this.curItemIdx > 0) {
      this.curItemIdx--
      this.emit()
    }
  }

  goNext() {
    if (this.curItemIdx < this.itemNav.length - 1) {
      this.curItemIdx++
      this.emit()
    }
  }

  openRefItem(itemId) {
    if (!itemId) return
    const navIdx = this.itemNav.findIndex((x) => x === itemId)
    if (navIdx !== -1) {
      this.curItemIdx = navIdx
      this.detachedStack = []
    } else {
      this.detachedStack.push(itemId)
    }
    this.emit()
  }

  returnToNav() {
    if (!this.detachedStack.length) return
    this.detachedStack.pop()
    this.emit()
  }

  goPrevOrReturn() {
    if (this.detachedStack.length) this.returnToNav()
    else this.goPrev()
  }

  teardown() {}
}

export class MasterTourController extends TourController {
  constructor({ sessionId, ...opts } = {}) {
    super(opts)
    this.sessionId = sessionId
    this.lastBroadcastItemId = null
    this.abortController = null
    this.isStartingQuiz = false
  }

  emit() {
    super.emit()
    const currentItemId = this.getCurrentItemId()
    if (currentItemId) {
      this.broadcastShowItem(currentItemId)
    }
  }

  async broadcastShowItem(itemId) {
    if (!itemId || !this.sessionId || this.lastBroadcastItemId === itemId) {
      return
    }

    if (this.abortController) {
      this.abortController.abort()
    }
    this.abortController = new AbortController()

    this.lastBroadcastItemId = itemId
    try {
      const url = `/api/sessions/${encodeURIComponent(this.sessionId)}/showItem`
      let res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemId }),
        signal: this.abortController.signal,
      })
      if (!res.ok) {
        console.error(`Broadcast showItem failed: ${res.status}`)
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Errore broadcastShowItem:', e)
      }
    }
  }

  async startQuiz() {
    if (!this.sessionId || this.isStartingQuiz) return false

    this.isStartingQuiz = true
    try {
      let res = await fetch(
        `/api/sessions/${encodeURIComponent(this.sessionId)}/startQuiz`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        },
      )

      if (!res.ok) {
        console.error(`Start quiz failed: ${res.status}`)
      }
      return res.ok
    } catch (err) {
      console.error('Errore startQuiz:', err)
      return false
    } finally {
      this.isStartingQuiz = false
    }
  }

  teardown() {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }
}

export class GuidedTourController extends TourController {
  constructor({ sessionId, username, onStartQuiz = null, ...opts } = {}) {
    super(opts)
    this.sessionId = sessionId
    this.username = username
    this.onStartQuiz = onStartQuiz
    this.eventSource = null
    this.hasReceivedFirstEvent = false
    this.refreshScheduled = false
  }

  connect() {
    if (!this.sessionId || typeof window === 'undefined') return
    const randomSuffix = (() => {
      const cryptoObj = globalThis.crypto
      if (!cryptoObj || typeof cryptoObj.getRandomValues !== 'function') {
        return Date.now().toString(36)
      }
      const bytes = new Uint8Array(4)
      cryptoObj.getRandomValues(bytes)
      return Array.from(bytes, (byte) =>
        byte.toString(16).padStart(2, '0'),
      ).join('')
    })()
    const username = this.username || `guided-${randomSuffix}`

    const joinUrl = `/api/sessions/${encodeURIComponent(this.sessionId)}/join?username=${encodeURIComponent(username)}`

    this.eventSource = new EventSource(joinUrl)

    this.eventSource.onerror = () => {
      if (
        this.eventSource &&
        this.eventSource.readyState === EventSource.CLOSED
      ) {
        const altUrl = `/api/sessions/${encodeURIComponent(this.sessionId)}/join?username=${encodeURIComponent(username)}`
        this.eventSource = new EventSource(altUrl)
        this.bindEvents()
      }
    }

    this.bindEvents()
  }

  bindEvents() {
    if (!this.eventSource) return

    if (!this.refreshScheduled && typeof window !== 'undefined') {
      this.refreshScheduled = true
      setTimeout(() => {
        if (!this.hasReceivedFirstEvent) {
          window.location.reload()
        }
      }, 2000)
    }

    this.eventSource.addEventListener('showItem', (event) => {
      try {
        this.hasReceivedFirstEvent = true
        const payload = JSON.parse(event.data || '{}')
        this.showItem(payload.itemId)
      } catch (_err) {}
    })

    this.eventSource.addEventListener('startQuiz', () => {
      this.hasReceivedFirstEvent = true
      if (typeof this.onStartQuiz === 'function') {
        this.onStartQuiz()
      }
    })
  }

  showItem(itemId) {
    if (!itemId) return
    const navIdx = this.itemNav.findIndex((x) => x === itemId)
    if (navIdx !== -1) {
      this.curItemIdx = navIdx
      this.detachedStack = []
    } else {
      this.detachedStack = [itemId]
    }
    this.emit()
  }

  goPrev() {}
  goNext() {}
  openRefItem() {}
  returnToNav() {}
  goPrevOrReturn() {}

  teardown() {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
  }
}
