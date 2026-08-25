<template>
  <div
    class="min-h-screen pb-32 bg-p-light font-serif text-p-dark selection:bg-p-soft overflow-x-hidden"
  >
    <!-- Museums List -->
    <div v-for="museum in museums" :key="museum._id" class="mb-14">
      <h2
        class="text-2xl font-bold underline mb-3 px-4 font-serif text-p-dark/90"
      >
        {{ museum.name }}
      </h2>
      <!-- Horizontally swipeable tours -->
      <div class="overflow-x-auto px-2 -mx-2">
        <div class="flex flex-nowrap gap-6">
          <div
            v-for="tour in museum.tours"
            :key="tour._id"
            class="flex-none w-72 h-96 bg-white rounded-2xl shadow-md border border-p-soft/40 relative transition-all hover:shadow-xl cursor-pointer"
            @click="showTourConfirm(tour)"
          >
            <!-- Photo with overlay -->
            <div
              class="relative h-48 rounded-t-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-p-light to-p-soft/20"
            >
              <img
                :src="
                  tour.thumbnail
                    ? `/api/assets/${tour.thumbnail}`
                    : 'https://dummyimage.com/320x240/efefef/a3a3a3.jpg&text=Tour'
                "
                alt="tour"
                class="absolute inset-0 w-full h-full object-cover mix-blend-multiply"
              />
              <div
                class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-p-dark/70 to-transparent px-4 py-2 rounded-b-2xl"
              >
                <div
                  class="text-xs text-p-light/90 truncate font-sans"
                  :title="tour.review"
                  style="
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  "
                >
                  {{
                    tour.review && tour.review.length > 60
                      ? tour.review.slice(0, 60) + '…'
                      : tour.review || ''
                  }}
                </div>
              </div>
            </div>
            <!-- Info Area -->
            <div
              class="p-5 flex flex-col gap-2 bg-p-soft/10 rounded-b-2xl h-[calc(100%-12rem)]"
            >
              <div
                class="font-semibold text-p-medium text-lg truncate font-serif"
              >
                {{ tour.name }}
              </div>
              <div
                class="flex items-center text-xs text-p-medium/70 gap-3 font-sans"
              >
                <span class="flex items-center gap-1">
                  <svg
                    class="inline w-4 h-4 -mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 8v4l3 2"
                    ></path>
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    ></circle>
                  </svg>
                  {{ tour.time || '--' }} min
                </span>
                <span class="flex items-center gap-1">
                  <svg
                    class="inline w-4 h-4 -mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 8c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 4c-2.21 0-4 1.12-4 2.5v2.5h8V14.5c0-1.38-1.79-2.5-4-2.5z"
                    ></path>
                  </svg>
                  €{{ tour.price || '--' }}
                </span>
                <span
                  class="ml-auto bg-p-soft/40 rounded-full px-2 py-0.5 text-p-medium text-xs font-sans"
                >
                  {{ getAuthorName(tour.author) || 'Unknown' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- More Button -->
      <div class="text-right px-4 mt-3">
        <button
          class="shared-button-fit-secondary px-5 font-sans"
          @click="onMore(museum)"
        >
          Mostra altro &rarr;
        </button>
      </div>
    </div>

    <!-- NavBar Fixed Bottom -->
    <nav
      class="fixed z-40 bottom-0 left-0 right-0 bg-white/80 backdrop-blur border-t border-p-soft/60 flex items-center justify-between px-4 py-3 shadow-lg"
      style="min-height: 56px"
    >
      <button @click="showMenu = true" aria-label="Menu" class="nav-icon-link">
        <svg
          class="w-6 h-6 text-p-dark"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <button
        @click="showSearch = true"
        aria-label="Search"
        class="flex-1 mx-4"
      >
        <div
          class="flex items-center w-full bg-p-soft/20 rounded-full px-5 py-2 shadow-sm transition-all font-sans hover:bg-p-soft/40"
        >
          <svg
            class="w-5 h-5 text-p-medium mr-2"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-4.35-4.35"
            />
          </svg>
          <span class="text-p-medium/60 text-sm">Cerca tour, musei…</span>
        </div>
      </button>
      <button
        @click="showProfile = true"
        aria-label="Profile"
        class="nav-avatar-trigger"
      >
        <img
          v-if="user.avatar"
          :src="user.avatar"
          class="rounded-full w-14 h-14 object-cover border-2 border-p-soft"
          alt="profile"
        />
        <div
          v-else
          class="bg-p-medium text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-lg"
        >
          {{ user.initials }}
        </div>
      </button>
    </nav>

    <!-- Menu Overlay -->
    <transition name="fade">
      <div
        v-if="showMenu"
        class="fixed inset-0 z-50 bg-p-dark/50 backdrop-blur-sm flex items-end"
        @click.self="showMenu = false"
      >
        <div
          class="w-full bg-white rounded-t-2xl border border-p-soft shadow-2xl p-8"
        >
          <div class="flex items-center justify-between mb-6">
            <div class="font-bold text-2xl text-p-dark font-serif">Menu</div>
            <button @click="showMenu = false" class="nav-icon-link">
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <ul class="space-y-4">
            <li>
              <button class="shared-button-full-secondary w-full font-sans">
                Home
              </button>
            </li>
            <li>
              <button class="shared-button-full-secondary w-full font-sans">
                Esplora
              </button>
            </li>
            <li>
              <button class="shared-button-full-secondary w-full font-sans">
                I miei ticket
              </button>
            </li>
            <li>
              <button class="shared-button-full-secondary w-full font-sans">
                Assistenza
              </button>
            </li>
          </ul>
        </div>
      </div>
    </transition>

    <!-- Search Overlay -->
    <transition name="fade">
      <div
        v-if="showSearch"
        class="fixed inset-0 z-50 bg-p-dark/50 backdrop-blur-sm flex items-end"
        @click.self="showSearch = false"
      >
        <div
          class="w-full bg-white rounded-t-2xl border border-p-soft shadow-2xl p-8"
        >
          <div class="flex items-center justify-between mb-6">
            <div class="font-bold text-2xl text-p-dark font-serif">Cerca</div>
            <button @click="showSearch = false" class="nav-icon-link">
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <input
            type="text"
            v-model="search"
            class="input input-bordered rounded-full w-full border-p-soft bg-white text-p-dark placeholder-p-medium focus:border-p-medium focus:ring-2 focus:ring-p-soft focus:outline-none font-sans font-normal shadow-sm px-6 py-3 mb-3 text-lg"
            placeholder="Cerca tra tour e musei…"
          />
          <div v-if="search" class="mt-4">
            <div class="text-sm text-p-medium/60 mb-2 font-sans">Risultati</div>
            <ul class="font-sans">
              <li
                v-for="item in searchResults"
                :key="item._id"
                class="py-2 border-b border-p-soft/30 last:border-b-0"
              >
                <span class="text-p-dark font-semibold">{{ item.name }}</span>
                <span class="text-p-medium/80 text-xs block">{{
                  item.type
                }}</span>
              </li>
              <li v-if="!searchResults.length" class="text-p-medium/50 py-2">
                Nessun risultato trovato.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </transition>

    <!-- Profile Overlay -->
    <transition name="fade">
      <div
        v-if="showProfile"
        class="fixed inset-0 z-50 bg-p-dark/50 backdrop-blur-sm flex items-end"
        @click.self="showProfile = false"
      >
        <div
          class="w-full bg-white rounded-t-2xl border border-p-soft shadow-2xl p-8"
        >
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <img
                v-if="user.avatar"
                :src="user.avatar"
                class="rounded-full w-16 h-16 object-cover border-2 border-p-soft"
              />
              <div
                v-else
                class="bg-p-medium text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-2xl"
              >
                {{ user.initials }}
              </div>
              <div>
                <div class="font-bold text-xl text-p-dark font-serif">
                  {{ user.name }}
                </div>
                <div class="text-p-medium/70 text-sm font-sans">
                  {{ user.email }}
                </div>
              </div>
            </div>
            <button @click="showProfile = false" class="nav-icon-link">
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <ul class="space-y-3 mt-4">
            <li>
              <button class="shared-button-full-secondary w-full font-sans">
                Impostazioni account
              </button>
            </li>
            <li>
              <button class="shared-button-full-secondary w-full font-sans">
                Prenotazioni
              </button>
            </li>
            <li>
              <button class="shared-button-full-primary w-full font-sans">
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </transition>

    <!-- Tour Start Confirmation Overlay -->
    <transition name="fade">
      <div
        v-if="showTourConfirmOverlay"
        class="fixed inset-0 z-50 bg-p-dark/40 backdrop-blur-sm flex items-end"
        @click.self="closeTourConfirm"
      >
        <div
          class="w-full bg-white rounded-t-2xl border border-p-soft shadow-2xl p-8"
        >
          <div class="flex items-center justify-between mb-6">
            <div class="font-bold text-2xl text-p-dark font-serif">
              Avvia tour?
            </div>
            <button @click="closeTourConfirm" class="nav-icon-link">
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div class="mb-6">
            <div class="font-bold text-lg text-p-dark font-serif mb-1">
              {{ selectedTour?.name }}
            </div>
            <div class="text-p-medium text-base font-sans mb-2">
              Sei sicuro di voler iniziare questo tour?
            </div>
          </div>
          <div class="flex gap-4">
            <button
              class="shared-button-full-primary flex-1 font-sans"
              @click="confirmStartTour"
            >
              Ok
            </button>
            <button
              class="shared-button-full-secondary flex-1 font-sans"
              @click="closeTourConfirm"
            >
              Annulla
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'MuseumsToursMobile',
  data() {
    return {
      museums: [],
      showMenu: false,
      showSearch: false,
      showProfile: false,
      search: '',
      user: {
        name: 'Anna Bianchi',
        email: 'anna.bianchi@email.com',
        avatar: '',
        initials: 'AB',
      },
      authors: {},
      showTourConfirmOverlay: false,
      selectedTour: null,
    }
  },
  computed: {
    searchResults() {
      if (!this.search.trim()) return []
      const searchLower = this.search.toLowerCase()
      let results = []
      for (const m of this.museums) {
        if (m.name && m.name.toLowerCase().includes(searchLower)) {
          results.push({ _id: m._id, name: m.name, type: 'Museo' })
        }
        for (const t of m.tours || []) {
          if (t.name && t.name.toLowerCase().includes(searchLower)) {
            results.push({
              _id: t._id,
              name: t.name,
              type: m.name || 'Tour',
            })
          }
        }
      }
      return results
    },
  },
  methods: {
    onMore(museum) {
      alert('Mostra altri tour per ' + (museum.name || ''))
    },
    getAuthorName(authorId) {
      if (!authorId) return ''
      return this.authors[authorId] || ''
    },
    async fetchAuthor(authorId) {
      if (!authorId || this.authors[authorId] !== undefined) return
      try {
        const res = await fetch(`/api/users/${authorId}`)
        if (!res.ok) throw new Error('Not found')
        const user = await res.json()
        this.authors[authorId] = user.username || 'Unknown'
      } catch (e) {
        this.authors[authorId] = 'Unknown'
      }
    },
    async fetchMuseumsAndTours() {
      try {
        const museumsRes = await fetch('/api/museums')
        let museumsMeta = await museumsRes.json()
        const museums = await Promise.all(
          museumsMeta.map(async (meta) => {
            try {
              const fullRes = await fetch(`/api/museums/${meta._id}`)
              const fullMuseum = await fullRes.json()
              let tours = []
              if (
                Array.isArray(fullMuseum.tours) &&
                fullMuseum.tours.length > 0
              ) {
                const toursRes = await fetch(
                  `/api/tours?museum=${fullMuseum._id}`,
                )
                tours = await toursRes.json()
              }
              return { ...fullMuseum, tours }
            } catch (err) {
              return { ...meta, tours: [] }
            }
          }),
        )
        this.museums = museums

        const authorIds = new Set()
        for (const museum of museums) {
          for (const tour of museum.tours || []) {
            if (tour.author) {
              authorIds.add(tour.author)
            }
          }
        }
        await Promise.all(
          Array.from(authorIds).map((id) => this.fetchAuthor(id)),
        )
      } catch (err) {
        this.museums = []
      }
    },
    showTourConfirm(tour) {
      this.selectedTour = tour
      this.showTourConfirmOverlay = true
    },
    closeTourConfirm() {
      this.showTourConfirmOverlay = false
      this.selectedTour = null
    },
    confirmStartTour() {
      if (this.selectedTour && this.selectedTour._id) {
        window.location.href = `/navigator/tour?tour=${this.selectedTour._id}`
      }
    },
    async checkLoggedIn() {
      try {
        const res = await fetch('/api/profile')
        const result = await res.json()
        if (!result) {
          window.location.href = '/login'
          return false
        }
        // Optionally update user data if provided
        if (result.name) {
          this.user.name = result.name
          this.user.email = result.email || this.user.email
          this.user.avatar = result.avatar || ''
          this.user.initials =
            result.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase() || this.user.initials
        }
        return true
      } catch (e) {
        window.location.href = '/login'
        return false
      }
    },
  },
  async mounted() {
    const loggedIn = await this.checkLoggedIn()
    if (!loggedIn) return
    this.fetchMuseumsAndTours()
  },
  watch: {
    museums: {
      deep: true,
      immediate: false,
      handler(newMuseums) {
        const authorIds = new Set()
        for (const museum of newMuseums) {
          for (const tour of museum.tours || []) {
            if (tour.author && this.authors[tour.author] === undefined) {
              authorIds.add(tour.author)
            }
          }
        }
        if (authorIds.size > 0) {
          Promise.all(Array.from(authorIds).map((id) => this.fetchAuthor(id)))
        }
      },
    },
  },
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
