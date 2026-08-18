import Alpine from 'alpinejs'

Alpine.data('privateViewer', () => ({
  tour: null,
  curr: 0,

  async init() {
    const id = window.location.pathname.split('/').pop()
    const response = await fetch('/api/tours/' + id)
    if (response.ok) {
      this.tour = await response.json()
    }
  },

  // Definiamo 'item' come getter reattivo
  get item() {
    return this.tour?.items?.[this.curr] || null
  },

  prev() {
    if (this.curr > 0) this.curr--
  },
  next() {
    if (this.tour?.items && this.curr < this.tour.items.length - 1) this.curr++
  },
}))

window.Alpine = Alpine
Alpine.start()
