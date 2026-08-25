<template>
  <div
    class="min-h-screen pb-32 bg-p-light font-serif text-p-dark selection:bg-p-soft overflow-x-hidden relative"
  >
    <!-- Top Large Image + Prev/Next controls -->
    <div
      class="relative w-full aspect-[4/3] bg-p-soft/30 flex items-center justify-center overflow-hidden"
    >
      <img
        v-if="currentItem && currentItem.image"
        :src="`/api/assets/${currentItem.image}`"
        alt="Item image"
        class="absolute inset-0 object-cover w-full h-full"
      />
      <img
        v-else
        src="https://dummyimage.com/900x675/efefef/a3a3a3.png&text=Item"
        class="absolute inset-0 object-cover w-full h-full"
        alt="Item placeholder"
      />
      <!-- Prev/Next Nav -->
      <button
        v-if="canGoPrev"
        @click="goPrev"
        aria-label="Item precedente"
        class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-p-dark/70 hover:bg-p-dark/90 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
      >
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        v-if="canGoNext"
        @click="goNext"
        aria-label="Item successivo"
        class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-p-dark/70 hover:bg-p-dark/90 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
      >
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
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
    <!-- Main Content -->
    <div class="px-5 pt-6 pb-28 max-w-lg mx-auto">
      <div class="flex items-center gap-5">
        <button
          v-if="detachedStack.length > 0"
          @click="returnToNav"
          aria-label="Torna tour"
          class="bg-p-soft hover:bg-p-soft/60 rounded-full p-2 text-p-medium mr-2"
        >
          <svg
            class="inline w-7 h-7"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 class="flex-1 text-2xl font-bold font-serif text-p-dark truncate">
          {{ currentItem ? currentItem.name : '...' }}
        </h1>
      </div>
      <!-- Mini media player -->
      <div
        class="my-5 bg-white rounded-2xl shadow-md border border-p-soft/40 p-3 flex gap-3 items-center"
      >
        <button
          @click="togglePlay"
          class="inline-flex items-center justify-center w-12 h-12 rounded-full shadow bg-p-medium text-white hover:bg-p-medium/80"
        >
          <svg
            v-if="!audioPlaying"
            class="w-7 h-7"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <polygon points="8,5 21,12 8,19" fill="currentColor" />
          </svg>
          <svg
            v-else
            class="w-7 h-7"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <rect x="6" y="5" width="4" height="14" fill="currentColor" />
            <rect x="14" y="5" width="4" height="14" fill="currentColor" />
          </svg>
        </button>
        <button
          @click="toggleMute"
          class="ml-1 text-p-medium hover:text-p-dark"
        >
          <svg
            v-if="audioMuted"
            class="w-7 h-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M1 1l22 22" />
            <path d="M9 9v6h4l5 5V4l-5 5H9z" />
          </svg>
          <svg
            v-else
            class="w-7 h-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M9 9v6h4l5 5V4l-5 5H9z" />
          </svg>
        </button>
        <div class="flex-1 min-w-0 ml-3">
          <div class="text-base text-p-dark font-sans truncate">
            {{
              currentItem && currentItem.audio
                ? 'Audio descrizione'
                : 'Nessuna audio'
            }}
          </div>
        </div>
      </div>
      <!-- Description (pick first for now) -->
      <div
        v-if="currentItem && currentItem.description"
        class="text-lg font-serif text-p-dark/90 leading-relaxed mb-10 mt-3"
      >
        {{
          Array.isArray(currentItem.description)
            ? currentItem.description[0]
            : currentItem.description
        }}
      </div>
      <div v-else class="text-p-medium/40 font-sans my-12">
        Nessuna descrizione disponibile.
      </div>
      <!-- Reference items -->
      <div v-if="refsItems.length" class="mt-6">
        <h3 class="font-semibold text-p-medium/90 font-sans mb-2 text-lg">
          Oggetti correlati
        </h3>
        <div class="flex gap-5 pb-2 overflow-x-auto">
          <div
            v-for="item in refsItems"
            :key="item._id"
            class="min-w-[10rem] flex-shrink-0 rounded-xl bg-white shadow border border-p-soft/40 p-3 flex flex-col items-center cursor-pointer hover:scale-105 active:scale-95 transition"
            @click="openRefItem(item._id)"
          >
            <img
              v-if="item.image"
              :src="`/api/assets/${item.image}`"
              alt="ref"
              class="w-24 h-24 object-cover rounded-lg bg-p-soft mb-2"
            />
            <img
              v-else
              src="https://dummyimage.com/96x96/efefef/a3a3a3.png&text=Item"
              class="w-24 h-24 object-cover rounded-lg bg-p-soft mb-2"
            />
            <div
              class="font-semibold text-center text-p-medium text-base font-sans truncate max-w-[9rem]"
            >
              {{ item.name || 'Oggetto' }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Bottom swipe-up panel -->
    <transition name="fade">
      <div
        v-if="bottomOverlay"
        class="fixed left-0 right-0 bottom-0 z-50 bg-white rounded-t-3xl border-t border-p-soft p-6 px-5 shadow-2xl transition-all"
        @touchstart.passive="onOverlayTouchStart"
        @touchend.passive="onOverlayTouchEnd"
      >
        <div class="w-16 h-1 mx-auto mb-4 rounded-full bg-p-soft/70" />
        <!-- Full media controls -->
        <div class="flex items-center gap-4 mb-6">
          <button
            @click="togglePlay"
            class="w-14 h-14 rounded-full shadow bg-p-dark text-white hover:bg-p-dark/80 flex items-center justify-center"
          >
            <svg
              v-if="!audioPlaying"
              class="w-8 h-8"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <polygon points="8,5 21,12 8,19" fill="currentColor" />
            </svg>
            <svg
              v-else
              class="w-8 h-8"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <rect x="6" y="5" width="4" height="14" fill="currentColor" />
              <rect x="14" y="5" width="4" height="14" fill="currentColor" />
            </svg>
          </button>
          <button
            @click="toggleMute"
            class="text-p-medium/80 hover:text-p-dark"
          >
            <svg
              v-if="audioMuted"
              class="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M1 1l22 22" />
              <path d="M9 9v6h4l5 5V4l-5 5H9z" />
            </svg>
            <svg
              v-else
              class="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M9 9v6h4l5 5V4l-5 5H9z" />
            </svg>
          </button>
          <label class="flex items-center gap-2 font-sans text-p-medium ml-4">
            Volume
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              v-model.number="audioVolume"
              class="w-24 accent-p-medium"
            />
          </label>
          <label class="flex items-center gap-2 font-sans text-p-medium ml-4">
            Velocità
            <select
              v-model.number="audioRate"
              class="border px-2 rounded text-base bg-p-soft/20"
            >
              <option :value="0.7">0.7x</option>
              <option :value="1">1x</option>
              <option :value="1.3">1.3x</option>
              <option :value="1.5">1.5x</option>
              <option :value="2">2x</option>
            </select>
          </label>
        </div>
        <!-- Questions -->
        <div>
          <div class="font-semibold mb-2 text-base text-p-dark/70 font-sans">
            Domande
          </div>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="q in 3"
              :key="q"
              class="shared-button-fit-secondary font-sans px-4"
            >
              Domanda {{ q }}
            </button>
          </div>
        </div>
      </div>
    </transition>
    <!-- Handle swipe gesture to open/close overlay (mobile first) -->
    <button
      v-if="!bottomOverlay"
      @click="bottomOverlay = true"
      aria-label="Apri pannello media"
      class="fixed left-1/2 -translate-x-1/2 bottom-2 z-40 bg-white/90 rounded-full border border-p-soft shadow px-5 py-2"
    >
      <svg
        class="w-8 h-8 text-p-dark"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M19 15l-7-7-7 7"
        />
      </svg>
    </button>
    <audio
      ref="audioEl"
      v-if="currentItem && currentItem.audio"
      :src="`/api/assets/${currentItem.audio}`"
      @ended="audioPlaying = false"
    />
  </div>
</template>

<script>
export default {
  name: 'TourNavigationMobile',
  data() {
    return {
      tourId: '',
      tour: null,
      itemNav: [],
      items: [],
      curItemIdx: 0,
      detachedStack: [],
      refsItems: [],
      bottomOverlay: false,
      audioPlaying: false,
      audioMuted: false,
      audioVolume: 1,
      audioRate: 1,
      // for touch gesture
      touch0: null,
      loadedItemsMap: {}, // _id : item obj
    }
  },
  computed: {
    // Which item we are showing
    currentItem() {
      const idxObj = this.getCurrentIdxObj()
      if (!idxObj) return null
      return this.items.find((i) => i._id === idxObj)
    },
    // For main navigation. True if can move
    canGoPrev() {
      return this.detachedStack.length === 0 && this.curItemIdx > 0
    },
    canGoNext() {
      return (
        this.detachedStack.length === 0 &&
        this.curItemIdx < this.itemNav.length - 1
      )
    },
  },
  watch: {
    currentItem: {
      handler(newVal) {
        if (newVal && Array.isArray(newVal.refs)) {
          const refs = newVal.refs
            .filter((refId) => refId !== undefined && refId !== null)
            .filter((refId) => this.items.some((i) => i._id === refId))
          this.refsItems = refs
            .map((refId) => this.items.find((i) => i._id === refId))
            .filter(Boolean)
        } else {
          this.refsItems = []
        }
        // Set up audio src & params if needed
        this.stopAudio()
      },
      immediate: true,
    },
    audioVolume(vol) {
      this.syncAudioProps()
    },
    audioMuted(muted) {
      this.syncAudioProps()
    },
    audioRate(rate) {
      this.syncAudioProps()
    },
    bottomOverlay(val) {
      if (!val) this.syncAudioProps()
    },
  },
  created() {
    this.initTour()
  },
  methods: {
    async initTour() {
      let tourId = ''
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.has('tour')) {
          tourId = urlParams.get('tour')
        }
      }
      if (!tourId) {
        tourId =
          this.$route?.params?.id || this.$route?.query?.tour || 'demo-tour'
      }
      this.tourId = tourId
      try {
        const tourRes = await fetch(`/api/tours/${this.tourId}`)
        if (!tourRes.ok) throw new Error('Not found')
        this.tour = await tourRes.json()
        this.itemNav = Array.isArray(this.tour.itemNav)
          ? this.tour.itemNav.slice()
          : []
        // At this point, this.tour.items and this.tour.itemNav are arrays of item ids.
        // We want to get ALL used item ids (nav, .items, .refs recursively) and fetch each via GET /api/items/<id>
        let allItemIds = new Set()
        if (Array.isArray(this.tour.itemNav)) {
          this.tour.itemNav.forEach(
            (id) => typeof id === 'string' && allItemIds.add(id),
          )
        }
        if (Array.isArray(this.tour.items)) {
          this.tour.items.forEach(
            (id) => typeof id === 'string' && allItemIds.add(id),
          )
        }
        // We'll fill up loadedItemsMap as we go.
        // Fetch main nav and items ids
        await this.fetchItemIdsRecursive(Array.from(allItemIds))
        // Now fill items array in nav order
        const itemsArr = Array.from(allItemIds)
          .map((id) => this.loadedItemsMap[id])
          .filter(Boolean)
        this.items = itemsArr
        // default to first item in nav
        this.curItemIdx = 0
        this.detachedStack = []
      } catch (e) {
        this.tour = null
        this.items = []
        this.itemNav = []
      }
    },
    async fetchItemIdsRecursive(ids) {
      // ids: string[]
      // Use loadedItemsMap to avoid duplicates
      const toFetch = ids.filter((id) => id && !this.loadedItemsMap[id])
      // fetch all
      const fetches = toFetch.map(async (id) => {
        try {
          const res = await fetch(`/api/items/${id}`)
          if (!res.ok) return null
          const item = await res.json()
          this.loadedItemsMap[id] = item
          return item
        } catch (e) {
          this.loadedItemsMap[id] = null
          return null
        }
      })
      const itemsObjs = await Promise.all(fetches)
      // Now recursively fetch referenced items (.refs array per item) if any
      let refsToFetch = []
      for (const item of itemsObjs) {
        if (item && Array.isArray(item.refs)) {
          for (let refId of item.refs) {
            if (refId && !this.loadedItemsMap[refId]) {
              refsToFetch.push(refId)
            }
          }
        }
      }
      // Remove dups
      refsToFetch = [...new Set(refsToFetch)]
      if (refsToFetch.length > 0) {
        await this.fetchItemIdsRecursive(refsToFetch)
      }
    },
    getCurrentIdxObj() {
      if (this.detachedStack.length > 0) {
        return this.detachedStack[this.detachedStack.length - 1]
      } else if (this.itemNav && this.itemNav[this.curItemIdx]) {
        return this.itemNav[this.curItemIdx]
      }
      return null
    },
    goPrev() {
      if (this.curItemIdx > 0) {
        this.curItemIdx--
      }
    },
    goNext() {
      if (this.curItemIdx < this.itemNav.length - 1) {
        this.curItemIdx++
      }
    },
    // Open a referenced item (may or may not be in nav)
    openRefItem(itemId) {
      if (!itemId) return
      // If itemId in the nav, just jump to it.
      const navIdx = this.itemNav.findIndex((x) => x === itemId)
      if (navIdx !== -1) {
        this.curItemIdx = navIdx
        this.detachedStack = []
      } else {
        // else: push to stack, "detached" navigation
        this.detachedStack.push(itemId)
      }
    },
    // Return from detached ref navigation
    returnToNav() {
      this.detachedStack.pop()
    },
    // === AUDIO ===
    togglePlay() {
      if (!this.currentItem || !this.currentItem.audio) return
      const audioEl = this.$refs.audioEl
      if (!audioEl) return
      if (this.audioPlaying) {
        audioEl.pause()
        this.audioPlaying = false
      } else {
        this.syncAudioProps()
        audioEl.play()
        this.audioPlaying = true
      }
    },
    stopAudio() {
      const audioEl = this.$refs.audioEl
      if (audioEl) {
        audioEl.pause()
        audioEl.currentTime = 0
        this.audioPlaying = false
      }
    },
    toggleMute() {
      this.audioMuted = !this.audioMuted
      this.syncAudioProps()
    },
    syncAudioProps() {
      this.$nextTick(() => {
        const audioEl = this.$refs.audioEl
        if (audioEl) {
          audioEl.muted = this.audioMuted
          audioEl.volume = this.audioVolume
          audioEl.playbackRate = this.audioRate
        }
      })
    },
    // === SWIPE UP PANEL GESTURE (easy mobile) ===
    onOverlayTouchStart(e) {
      if (e.touches && e.touches.length === 1) {
        this.touch0 = { y: e.touches[0].clientY }
      }
    },
    onOverlayTouchEnd(e) {
      if (!this.touch0 || !e.changedTouches) return
      const dy = e.changedTouches[0].clientY - this.touch0.y
      if (dy > 50) {
        // swipe down
        this.bottomOverlay = false
      }
      this.touch0 = null
    },
  },
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.24s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
