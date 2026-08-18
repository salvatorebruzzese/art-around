import Alpine from 'alpinejs'

Alpine.store('marketplace', {
  cardDecorator:
    'w-full h-80 rounded-3xl flex flex-col overflow-hidden shadow-lg border border-p-soft bg-white group hover:-translate-y-1 hover:shadow-xl transition-all duration-300',
  museums: [],
  filters: {
    museum: null,
    purchased: false,
    search: '',
  },
  allTours: [],
  allItems: [], // Dichiarato per evitare ReferenceError
  view: 'tour', // | 'item'
  profile: null,
  user: null,

  get filteredTours() {
    const fmus = this.filters.museum
    const fpur = this.filters.purchased
    const user = this.user
    return this.allTours
      .filter((t) => (fmus ? t.museum === fmus : true))
      .filter((t) => (user && fpur ? user.purchasedTours.includes(t) : true))
      .filter((t) => t.name.startsWith(this.filters.search))
  },

  // TODO: refactor into user-logged component
  get filteredItems() {
    console.log(this.allItems)
    // const fmus = this.filters.museum
    const user = this.user
    return this.allItems.filter((i) => user?.purchasedTours.includes(i.tour))

    // .filter((i) => (fmus ? i.museum === fmus : true))
    // .filter((i) => (user && fpur ? user.purchasedTours.includes(i) : true))
    // .filter((i) => i.name.startsWith(this.filters.search))
  },

  get filtered() {
    return this.view === 'tour' ? this.filteredTours : this.filteredItems
  },

  async init() {
    const [museums, tours, items, profile] = await Promise.all([
      fetch('/api/museums/').then((r) => r.json()),
      fetch('/api/tours/').then((r) => r.json()),
      fetch('/api/items/').then((r) => r.json()),
      fetch('/api/profile/')
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ])

    if (profile) {
      this.user = await fetch(`/api/users/${profile._id}`)
        .then((r) => r.json())
        .catch((e) => console.log(e)) // TODO: better err handl.
    }

    this.museums = museums
    this.allTours = tours
    this.allItems = items
    this.profile = profile
  },
})

window.Alpine = Alpine
Alpine.start()
