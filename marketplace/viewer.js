import Alpine from 'alpinejs'
import './userManager'

Alpine.data('viewer', () => ({
  /* TODO: handle non-logged case / unauthorized case */
  tour: null,
  item: null,
  curr: 0,

  async init() {
    const url = new URL(window.location.href)
    const tourId = url.pathname.split('/').filter(Boolean).at(1)
    const itemId = url.searchParams.get('item')

    const response = await fetch('/api/tours/' + tourId)
    if (response.ok) {
      this.tour = await response.json()
      if (itemId) {
        this.item = await fetch('/api/items/' + itemId).then((r) =>
          r.ok ? r.json() : null,
        )
        this.curr = this.tour.items.indexOf(itemId)
        if (!this.item) await this.getItem()
      } else await this.getItem()
    }
  },

  async getItem() {
    if (!this.tour?.items?.[this.curr]) return
    const response = await fetch('/api/items/' + this.tour.items[this.curr])
    if (response.ok) {
      this.item = await response.json()
    } else {
      // first: await user
      if (!Alpine.store('userManager').user)
        await Alpine.store('userManager').init()
      // second: application logic
      if (!Alpine.store('userManager').user) {
        window.location.href = '../login/'
      } else {
        alert('You did not buy this visit')
        window.location.href = '../marketplace/'
      }
    }
  },

  async prev() {
    if (this.curr > 0) {
      this.curr--
      await this.getItem()
      this.updateURL()
    }
  },

  async next() {
    if (this.tour?.items && this.curr < this.tour.items.length - 1) {
      this.curr++
      await this.getItem()
      this.updateURL()
    }
  },
  updateURL() {
    const url = new URL(window.location)
    url.searchParams.set('item', this.item._id) // newItemId is your updated ID
    history.pushState({}, '', url)
  },
}))

window.Alpine = Alpine
Alpine.start()
