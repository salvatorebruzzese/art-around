import Alpine from 'alpinejs'
import './userManager.js'
import './quick-nav.js'
import { getTour, saveTour } from './api/tours.js'
import { saveItem, deleteItem, getItemsByTour, getItem } from './api/items.js'
import { BoardManager, Board, refsArrManager } from './boards.js'

document.addEventListener('alpine:init', () => {
  Alpine.data('editorState', () => ({
    // Central state
    tour: null,
    allMetaItems: [],
    looseMetaItems: [],
    itemsCache: [],
    currentItem: null,
    currentItemIdx: -1,
    currentItemId: null,
    boards: {},
    boardMgr: null,
    isSubmitting: false,
    emptyFormData: {
      _id: null,
      name: 'New item',
      itemAuthor: null,
      tour: '',
      license: '',
      explanations: [
        { level: 'simple', text: '', durationSeconds: 0 },
        { level: 'normal', text: '', durationSeconds: 0 },
        { level: 'advanced', text: '', durationSeconds: 0 },
      ],
    },
    formData: {
      _id: null,
      name: 'New item',
      itemAuthor: null,
      tour: '',
      license: '',
      explanations: [{ level: '', text: '', duration: 0 }],
    },
    new_count: 0,

    async init() {
      // Setup boards and managers
      this.boardMgr = new BoardManager()
      this.boards = {
        itemNav: new Board('itemNav', this.boardMgr, {
          controls: true,
          dropZoneStyle:
            'bg-green-200 border-2 border-dashed border-green-600 text-green-600 cursor-pointer',
          dropZoneText: 'Drop here to order',
        }),
        stash: new Board('stash', this.boardMgr, {
          dropZoneStyle:
            'bg-gray-300 border-2 border-dashed border-gray-400 text-gray-500 cursor-pointer',
          dropZoneText: 'Drop here to stash',
        }),
        toDelete: new Board('toDelete', this.boardMgr, {
          dropZoneStyle:
            'bg-red-200 border-2 border-dashed border-red-700 text-red-700 cursor-pointer',
          dropZoneText: 'Drop here to delete',
        }),
        refs: new Board('refs', this.boardMgr, {
          dropZoneStyle:
            'bg-blue-200 border-2 border-dashed border-blue-700 text-blue-700 cursor-pointer',
          dropZoneText: 'Drop here to reference.',
          arrManager: new refsArrManager(this),
        }),
      }

      // Auth/user state (assuming your user module already inits correctly)
      Alpine.store('userManager')
        .getUser()
        .then((u) => (this.user = u))

      // Load tour + items
      const url = new URL(window.location.href)
      const tourId = url.pathname.split('/').filter(Boolean).at(2)
      const itemId = url.searchParams.get('item')
      const tour = await getTour(tourId)
      this.tour = tour

      // Items from API
      const items = await getItemsByTour(tour._id)
      this.allMetaItems = items
      this.looseMetaItems = [...items] // shallow

      // Set up itemNav and boards
      let diff = []
      this.looseMetaItems
        .filter((i) => tour.itemNav.some((nid) => nid === i._id))
        .forEach((i) => {
          this.boards.itemNav.arrManager.add(i)
          diff.push(i)
        })

      this.looseMetaItems = this.looseMetaItems.filter(
        (item) => !diff.includes(item),
      )

      this.loadItem(itemId)
    },

    // Form and item load logic
    async loadItem(itemId) {
      if (!itemId) return
      const idx_query = Object.values(this.boards).find(
        (board) => board.arr.findIndex((i) => i === itemId) !== -1,
      ) // rets null
      let idx = idx_query ? idx_query : -1
      if (idx !== -1) this.currentItemIdx = idx
      let cacheIdx = this.itemsCache.findIndex((i) => i._id === itemId)
      let item = this.itemsCache[cacheIdx]
      if (!item) {
        item = await getItem(itemId)
        this.currentItemId = itemId // HACK: needed for refs
        this.itemsCache.push(item)
        // HACK: initialize refs only when not cached
        if (item.refs) {
          this.looseMetaItems
            .filter((i) => item.refs.some((r) => r === i._id))
            .forEach((i) => {
              this.boards.refs.arrManager.put(i)
            })
        }
      }
      this.currentItem = item
      this.currentItemId = itemId
      this.populateFormData(item)
    },

    populateFormData(item) {
      this.formData = {
        _id: item?._id || null,
        name: item?.name || '',
        tour: item?.tour || '',
        license: item?.license || '',
        explanations:
          Array.isArray(item?.explanations) && item.explanations.length > 0
            ? [
                {
                  level: item.explanations[0]?.level || '',
                  text: item.explanations[0]?.text || '',
                  durationSeconds: 0, // Placeholder; customize if you have duration data
                },
              ]
            : [
                {
                  level: '',
                  text: '',
                  durationSeconds: 0,
                },
              ],
      }
    },
    async submitForm() {
      try {
        this.isSubmitting = true
        // Remove cached version, if any
        const idx = this.itemsCache.findIndex(
          (i) => i._id === this.formData._id,
        )
        if (idx > -1) this.itemsCache.splice(idx, 1)

        // inject author and tour
        this.formData.itemAuthor = this.user._id
        this.formData.tour = this.tour._id

        // handle new item creation
        let old_id = this.formData._id
        const isNewItem = typeof old_id === 'number' && !isNaN(old_id)
        if (isNewItem) this.formData._id = null

        let res = await saveItem(this.formData)

        // handle new item id
        if (isNewItem) {
          Object.values(this.boards).forEach((board) => {
            let idx = board.arrManager.arr.findIndex((i) => i._id === old_id)
            if (idx != -1) {
              let meta = board.arrManager.get(idx)
              meta._id = res._id
            }
          })
        }

        // update boards
        Object.values(this.boards).forEach((board) => {
          let idx = board.arrManager.arr.findIndex((i) => i._id === res._id)
          if (idx != -1) {
            let meta = board.arrManager.get(idx)
            meta.name = res.name // this is the only thing displayed on the cards
          }
        })

        this.isSubmitting = false
        this.loadItem(res._id)
        alert('Modifiche salvate con successo.')
      } catch (err) {
        this.isSubmitting = false
        if (err.json) {
          const data = await err.json().catch(() => ({}))
          alert('Errore nel salvataggio: ' + (data.error?.message || ''))
        } else {
          alert('Errore di rete: ' + err.message)
        }
      }
    },

    // Add item (simplified: creates blank/new form, does NOT POST until submit)
    // Side-effect: loads the (fake) item
    newItem() {
      this.currentItem = null
      this.currentItemIdx = -1
      this.currentItemId = null
      // HACK: circumven Alpine PROXY
      this.formData = structuredClone(
        JSON.parse(JSON.stringify(this.emptyFormData)),
      )
      this.formData._id = this.new_count
      let meta_item = {
        _id: ++this.new_count, // TODO: don't push this
        name: this.formData.name,
        itemAuthor: this.user._id,
        tour: this.tour._id,
        license: this.formData.license,
      }
      this.boards.stash.arrManager.add(meta_item)
      this.boards.stash.nextFocus = meta_item
      // HACK: load meta to cache, undefined fields will be populated
      this.itemsCache.push(meta_item)
      this.loadItem(meta_item._id)
    },

    // Delete: move from any board to ToDelete
    // _deleteItem(item) {
    //   for (const boardName of ['items', 'stash']) {
    //     let board = this.boards[boardName]
    //     if (board.arr.find((i) => i._id === item._id)) {
    //       board.remove(item)
    //       this.boards.toDelete.add(item)
    //       break
    //     }
    //   }
    //   // Reset form if needed
    //   if (item._id === this.formManager.formData._id) {
    //     this.formManager.formData = structuredClone(
    //       this.formManager.emptyFormData,
    //     )
    //   }
    //   // Load fallback item if available
    //   if (this.boards.items.length === 0 && this.items.length > 0) {
    //     let fallback = this.items.find(
    //       (i) => !this.boards.toDelete.arr.find((j) => j._id === i._id),
    //     )
    //     if (fallback) this.loadItem(fallback._id)
    //   } else if (this.boards.items.arr[0]) {
    //     this.loadItem(this.boards.items.arr[0]._id)
    //   }
    // },
    addItem(selId) {
      let found = this.looseMetaItems.find((item) => item._id === selId)
      if (!found) {
        Object.values(this.boards).forEach((board) => {
          if (found) return
          else found = board.arr.find((item) => item._id === selId)
        })
      }
      if (found) {
        this.boards.stash.arrManager.add(found)
      }
    },
    async saveItemNav() {
      try {
        await saveTour({
          _id: this.tour._id,
          itemNav: this.boards.itemNav.arr.map((item) => item._id),
          items: Array.from(
            new Set([
              ...this.looseMetaItems,
              ...this.boards.itemNav.arr,
              ...this.boards.stash.arr,
            ]),
          ).map((i) => i._id),
        })
        for (const item of this.boards.toDelete.arr) {
          await deleteItem(item._id)
        }
        this.boards.toDelete.arrManager.clear()
        alert('Modifiche salvate con successo.')
      } catch (e) {
        alert('Errore: ' + (e.message || 'unknown'))
      }
    },
  }))
})

window.Alpine = Alpine
Alpine.start()
