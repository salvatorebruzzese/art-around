import Alpine from 'alpinejs'
import './userManager'
import { ItemNavigator } from './itemNavigator'

Alpine.data('viewer', () => ({
  nav: null,

  async init() {
    const url = new URL(window.location.href)
    const tourId = url.pathname.split('/').filter(Boolean).at(1)
    const itemId = url.searchParams.get('item')
    this.nav = new ItemNavigator(tourId, itemId)
    await this.nav.init()
  },
}))

window.Alpine = Alpine
Alpine.start()
