import Alpine from 'alpinejs'
import { getTour, saveTour } from '../marketplace/api/tours'
import { saveItem, getItemsByTour } from '../marketplace/api/items'

export class TourNavigation {
  tour = null
  itemNav = []
  items = []
  user = null
  selectedId = null
  constructor() {}
  async initialize(tourId, startingItemId) {
    // Auth/user state (assuming your user module already inits correctly)
    Alpine.store('userManager')
      .getUser()
      .then((u) => (this.user = u))

    this.tour = await getTour(tourId)
    const res = await getItemsByTour(this.tour._id)
    res.forEach((i) => (this.items[i._id] = i))
    this.itemNav = this.tour.itemNav
    this.selectedId = startingItemId
  }

  saveTour() {
    this.items.map(saveItem)
    saveTour({
      _id: this.tour._id,
      itemNav: this.itemNav,
      items: this.items.map((i) => i._id), // arr of ids
      // will be extended
    })
  }

  async initByURL() {
    const url = new URL(window.location.href)
    const tourId = url.pathname.split('/').filter(Boolean).at(2)
    const itemId = url.searchParams.get('item')
    await this.initialize(tourId, itemId)
  }
}
