import Alpine from 'alpinejs'

Alpine.store('marketplaceComponent', {
  decorator:
    'w-full h-80 rounded-3xl flex flex-col overflow-hidden shadow-lg border border-p-soft bg-white group hover:-translate-y-1 hover:shadow-xl transition-all duration-300',
  museums: [],
  selectedMuseum: '',
  allTours: [],
  allItems: [], // Dichiarato per evitare ReferenceError
  selectedView: 'VISITE',
  user: null,

  get filteredTours() {
    return this.selectedMuseum
      ? this.allTours.filter((t) => t.museum === this.selectedMuseum)
      : this.allTours
  },

  get filteredItems() {
    return this.selectedMuseum
      ? this.allItems.filter((item) => item.museum === this.selectedMuseum)
      : this.allItems
  },

  get filtered() {
    return this.selectedView === 'VISITE'
      ? this.filteredTours
      : this.filteredItems
  },

  async init() {
    const [museums, tours, items, user] = await Promise.all([
      fetch('/api/museums/').then((r) => r.json()),
      fetch('/api/tours/').then((r) => r.json()),
      fetch('/api/items/').then((r) => r.json()),
      fetch('/api/profile/')
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ])

    this.museums = museums
    this.allTours = tours
    this.allItems = items
    this.user = user
  },
})

Alpine.store('accessComponent', {
  async logout() {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
    })
    window.location.href = '../home/'
  },
})

window.Alpine = Alpine
Alpine.start()
