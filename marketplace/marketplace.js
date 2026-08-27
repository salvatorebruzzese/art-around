import Alpine from 'alpinejs'
import fuzzysearch from 'fuzzysearch'
import './userManager'
import './quick-nav.js'

window.addEventListener('popstate', () => {
  window.location.reload()
})
document.addEventListener('alpine:init', () => {
  Alpine.data('marketplace', () => ({
    cardDecorator:
      'w-full h-80 rounded-3xl flex flex-col overflow-hidden shadow-p-soft shadow-sm  bg-white group hover:-translate-y-1 hover:shadow-xl transition-all duration-300',
    museums: [],
    filters: {
      museum: null,
      purchased: false,
      search: '',
    },
    allTours: [],
    allItems: [], // Dichiarato per evitare ReferenceError
    view: 'tour', // | 'item'
    user: null,
    showPreview: false,
    currPreview: null,
    cartTours: [],

    get filteredTours() {
      const fmus = this.filters.museum
      const fpur = this.filters.purchased
      const user = this.user
      return this.allTours
        .filter((t) => (fmus ? t.museum === fmus : true))
        .filter((t) =>
          user && fpur
            ? user.purchasedTours.includes(t._id) ||
              user.authoredTours.includes(t._id)
            : true,
        )
        .filter((t) => fuzzysearch(this.filters.search, t.name))
    },

    get filteredItems() {
      const fmus = this.filters.museum
      const user = this.user
      return this.allItems
        .filter(
          (i) =>
            user?.purchasedTours.includes(i.tour) ||
            user?.authoredTours.includes(i.tour),
        )
        .filter((i) => (fmus ? i.museum === fmus : true))
        .filter((i) => fuzzysearch(this.filters.search, i.name))
    },

    get filtered() {
      return this.view === 'tour' ? this.filteredTours : this.filteredItems
    },

    async init() {
      const [museums, tours, items] = await Promise.all([
        fetch('/api/museums/').then((r) => r.json()),
        fetch('/api/tours/').then((r) => r.json()),
        fetch('/api/items/').then((r) => r.json()),
      ])

      this.museums = museums
      this.allTours = tours
      this.allItems = items
      this.user = await Alpine.store('userManager').getUser() // NOTE: a refresh i needed to change user
    },

    hasAccess(tourId) {
      return Boolean(
        this.user?.purchasedTours?.includes(tourId) ||
        this.user?.authoredTours?.includes(tourId),
      )
    },
  }))
})

window.Alpine = Alpine
Alpine.start()
