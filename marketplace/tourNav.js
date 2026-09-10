import Alpine from 'alpinejs'
import { getTour } from '../marketplace/api/tours'
import { getItemsByTour } from '../marketplace/api/items'

export class TourNavigation {
  tour = null
  itemNav = []
  items = []
  user = null
  selectedId = null
  constructor() {}
  async initialize(tourId, startingItemId) {
    const userManager = Alpine.store('userManager')
    if (userManager && typeof userManager.getUser === 'function') {
      userManager.getUser().then((u) => (this.user = u))
    }

    this.tour = await getTour(tourId)
    const res = await getItemsByTour(this.tour._id)
    res.forEach((i) => (this.items[i._id] = i))
    this.itemNav = this.tour.itemNav
    this.selectedId = startingItemId ? startingItemId : res.at(0)._id
  }

  async initByURL() {
    const url = new URL(window.location.href)
    const tourId = url.pathname.split('/').filter(Boolean).at(2)
    const itemId = url.searchParams.get('item')
    await this.initialize(tourId, itemId)
  }
}
