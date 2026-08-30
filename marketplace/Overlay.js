import Alpine from 'alpinejs'

Alpine.data('OverlayDispatcher', (eventName) => ({
  mkOverlayRequest(body) {
    return new Promise((res) => {
      const reqId = String(Date.now())
      const handler = (e) => {
        if (e.detail.id === reqId) {
          res(e.detail.body)
          document.removeEventListener(eventName + ':response', handler)
        }
      }
      document.addEventListener(eventName + ':response', handler)
      this.$dispatch(eventName + ':request', {
        id: reqId,
        body: body,
      })
    })
  },
}))

Alpine.data('OverlayListener', (eventName) => ({
  open: false,
  reqId: null,
  body: null,
  init() {
    window.addEventListener(eventName + ':request', (e) => {
      this.open = true
      this.reqId = e.detail.id
      this.body = e.detail.body
    })
  },

  close(status) {
    this.open = false
    this.body.status = status
    this.$dispatch(eventName + ':response', {
      id: this.reqId,
      body: this.body,
    })
  },
}))
