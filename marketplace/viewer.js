import Alpine from 'alpinejs'
import './userManager'
import { ItemNavigator } from './itemNavigator'

Alpine.data('viewer', () => ({
  nav: null,
  item: null,
  tour: null,

  async init() {
    const url = new URL(window.location.href)
    const tourId = url.pathname.split('/').filter(Boolean).at(1)
    const itemId = url.searchParams.get('item')
    this.nav = new ItemNavigator()
    let res = await this.nav.init(tourId, itemId)
    this.item = res.item
    this.tour = res.tour
  },
}))

window.Alpine = Alpine
Alpine.start()
