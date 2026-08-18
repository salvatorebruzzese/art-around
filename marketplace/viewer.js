import Alpine from 'alpinejs'

Alpine.data('viewer', () => ({
  tour: null,
  item: null,
  curr: 0,

  async init() {
    const id = window.location.pathname.split('/').pop()
    const response = await fetch('/api/tours/' + id)
    if (response.ok) {
      this.tour = await response.json()
      await this.getItem()
    }
  },

  async getItem() {
    if (!this.tour?.items?.[this.curr]) return
    const response = await fetch('/api/items/' + this.tour.items[this.curr])
    if (response.ok) {
      this.item = await response.json()
    }
  },

  async prev() {
    if (this.curr > 0) {
      this.curr--
      await this.getItem()
    }
  },

  async next() {
    if (this.tour?.items && this.curr < this.tour.items.length - 1) {
      this.curr++
      await this.getItem()
    }
  },
}))

window.Alpine = Alpine
Alpine.start()
