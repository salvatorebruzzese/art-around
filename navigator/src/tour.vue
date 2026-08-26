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
                : 'Nessun audio'
            }}
          </div>
        </div>
      </div>
      <!-- Explanation (One At A Time) -->
      <div v-if="explanations && explanations.length" class="mb-10 mt-3">
        <div class="mb-5">
          <div class="text-p-medium font-semibold font-sans mb-1 capitalize">
            {{ getLevelLabel(selectedExplanation.level) }}
            <span
              v-if="selectedExplanation.durationSeconds"
              class="text-p-dark/50 font-sans text-sm ml-2"
            >
              ({{ formatDuration(selectedExplanation.durationSeconds) }})
            </span>
          </div>
          <div class="text-lg font-serif text-p-dark/90 leading-relaxed">
            {{ selectedExplanation.text }}
          </div>
        </div>
      </div>
      <!-- Fallback description if no explanations -->
      <div
        v-else-if="currentItem && currentItem.description"
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
    <swipeOverlay>
      <template #default>
        <div class="no-swipe">
          <div class="flex flex-col items-center font-sans ml-4 mr-4 gap-6">
            <!-- velocity controls -->
            <div class="flex w-full gap-4">
              <label class="flex items-center text-p-medium">Velocità</label>
              <div class="flex gap-2 flex-1">
                <button
                  v-for="rate in [0.75, 1, 1.25, 1.5, 2]"
                  :key="rate"
                  @click="audioRate = rate"
                  class="shared-button-flex-secondary whitespace-nowrap"
                >
                  <span>&times {{ rate }}</span>
                </button>
              </div>
            </div>
            <!-- Explanation select -->
            <div v-if="explanations && explanations.length > 1" class="w-full">
              <label
                class="font-semibold mb-2 text-base text-p-dark/70 font-sans block"
                >Livello spiegazione</label
              >
              <select
                v-model="selectedExplanationIdx"
                @change="onExplanationIdxChange"
                class="mt-1 block w-full rounded-lg border border-p-soft px-3 py-2 font-sans text-base focus:ring-2 focus:ring-p-medium"
              >
                <option
                  v-for="(ex, idx) in explanations"
                  :key="ex.level || idx"
                  :value="idx"
                >
                  {{ getLevelLabel(ex.level) }}
                </option>
              </select>
            </div>
            <!-- Questions -->
            <div>
              <div
                class="font-semibold mb-2 text-base text-p-dark/70 font-sans"
              >
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
        </div>
        <audio
          ref="audioEl"
          v-if="currentItem && currentItem.audio"
          :src="`/api/assets/${currentItem.audio}`"
          @ended="audioPlaying = false"
        />
      </template>
    </swipeOverlay>
  </div>
</template>

<script>
import { ref } from 'vue'
import swipeOverlay from './swipeOverlay.vue'
export default {
  components: {
    swipeOverlay,
  },

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
      audioRate: 1,
      touch0: null,
      openTouch0: null,
      loadedItemsMap: {},
      overlayVisible: ref(false),
      audioMuted: false,
      audioVolume: 1,
      selectedExplanationIdx: 0,
      userSelectedLevel: null,
    }
  },
  computed: {
    currentItem() {
      const idxObj = this.getCurrentIdxObj()
      if (!idxObj) return null
      return this.items.find((i) => i._id === idxObj)
    },
    canGoPrev() {
      return this.detachedStack.length === 0 && this.curItemIdx > 0
    },
    canGoNext() {
      return (
        this.detachedStack.length === 0 &&
        this.curItemIdx < this.itemNav.length - 1
      )
    },
    explanations() {
      if (
        this.currentItem &&
        Array.isArray(this.currentItem.explanations) &&
        this.currentItem.explanations.length > 0
      ) {
        return this.currentItem.explanations.filter(
          (ex) =>
            ex &&
            typeof ex === 'object' &&
            typeof ex.text === 'string' &&
            ex.text.trim().length > 0,
        )
      }
      return []
    },
    selectedExplanation() {
      // returns the currently selected explanation, fallback to first
      const exps = this.explanations
      if (!exps.length) return {}
      return exps[this.selectedExplanationIdx] || exps[0]
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
        this.stopAudio()
        // select explanation index based on cached level if possible, else fallback
        this.setBestExplanationIdx()
      },
      immediate: true,
    },
    explanations(newList, oldList) {
      this.setBestExplanationIdx()
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
        await this.fetchItemIdsRecursive(Array.from(allItemIds))
        const itemsArr = Array.from(allItemIds)
          .map((id) => this.loadedItemsMap[id])
          .filter(Boolean)
        this.items = itemsArr
        this.curItemIdx = 0
        this.detachedStack = []
      } catch (e) {
        this.tour = null
        this.items = []
        this.itemNav = []
      }
    },
    async fetchItemIdsRecursive(ids) {
      const toFetch = ids.filter((id) => id && !this.loadedItemsMap[id])
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
    openRefItem(itemId) {
      if (!itemId) return
      const navIdx = this.itemNav.findIndex((x) => x === itemId)
      if (navIdx !== -1) {
        this.curItemIdx = navIdx
        this.detachedStack = []
      } else {
        this.detachedStack.push(itemId)
      }
    },
    returnToNav() {
      this.detachedStack.pop()
    },
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
    getLevelLabel(level) {
      if (!level) return 'Descrizione'
      switch (level) {
        case 'simple':
          return 'Semplice'
        case 'normal':
          return 'Normale'
        case 'advanced':
          return 'Avanzata'
        default:
          return level && typeof level === 'string'
            ? level.charAt(0).toUpperCase() + level.slice(1)
            : 'Descrizione'
      }
    },
    formatDuration(seconds) {
      if (typeof seconds !== 'number' || isNaN(seconds)) return ''
      const m = Math.floor(seconds / 60)
      const s = Math.round(seconds % 60)
      return m > 0 ? `${m}m ${s}s` : `${s}s`
    },
    onExplanationIdxChange() {
      // store user-selected level string for later cache
      const exps = this.explanations
      if (!exps.length) {
        this.userSelectedLevel = null
        return
      }
      const idx = this.selectedExplanationIdx
      if (exps[idx] && exps[idx].level) {
        this.userSelectedLevel = exps[idx].level
      } else {
        this.userSelectedLevel = null
      }
    },
    setBestExplanationIdx() {
      // On current item or explanations change, try to select the cached user-selected level if possible.
      const exps = this.explanations
      // If no explanations, reset
      if (!exps.length) {
        this.selectedExplanationIdx = 0
        return
      }
      // If only one, always 0
      if (exps.length === 1) {
        this.selectedExplanationIdx = 0
        return
      }
      // Try to find user preferred level
      if (this.userSelectedLevel) {
        // Try exact match first
        const prefIdx = exps.findIndex(
          (ex) => ex.level === this.userSelectedLevel,
        )
        if (prefIdx !== -1) {
          this.selectedExplanationIdx = prefIdx
          return
        }
        // If not found, try to find the nearest
        const possibleLevels = ['simple', 'normal', 'advanced']
        const userIdx = possibleLevels.indexOf(this.userSelectedLevel)
        // pick the first available in order nearest the userIdx
        let nearestIdx = null
        let nearestDistance = Infinity
        exps.forEach((ex, idx) => {
          const exIdx = possibleLevels.indexOf(ex.level)
          if (exIdx === -1 || userIdx === -1) return
          const dist = Math.abs(exIdx - userIdx)
          if (dist < nearestDistance) {
            nearestDistance = dist
            nearestIdx = idx
          }
        })
        if (nearestIdx !== null) {
          this.selectedExplanationIdx = nearestIdx
          return
        }
        // Fallback: select the first
        this.selectedExplanationIdx = 0
        return
      }
      // No cached level, default to 0
      this.selectedExplanationIdx = 0
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
