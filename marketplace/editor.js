import Alpine from 'alpinejs'
import './userManager.js'
import './quick-nav.js'
import { getTour, saveTour } from './api/tours.js'
import { getItemsByTour, getItem, deleteItem } from './api/items.js'
import { createItemNav } from './itemNav.js'
import { createDragDropManager } from './dragDropManager.js'
import { useBoard } from './boards.js'
import { createItemFormManager } from './itemFormManager.js'

document.addEventListener('alpine:init', () => {
  Alpine.data('editorState', () => ({
    // Central state
    tour: null,
    items: [],
    itemsCache: [],
    itemNav: null, // instance
    currentItem: null,
    currentItemIdx: -1,
    currentItemId: null,
    boards: {},
    dragDrop: null,
    formManager: null,
    doView: null,

    async init() {
      // Setup boards and managers
      this.boards = {
        items: useBoard('items', [], {
          controls: true,
          dropZoneStyle:
            'bg-green-200 border-2 border-dashed border-green-600 text-green-600 cursor-pointer',
          dropZoneText: 'Drop here to order',
        }),
        stash: useBoard('stash', [], {
          dropZoneStyle:
            'bg-gray-300 border-2 border-dashed border-gray-400 text-gray-500 cursor-pointer',
          dropZoneText: 'Drop here to stash',
        }),
        toDelete: useBoard('toDelete', [], {
          dropZoneStyle:
            'bg-red-200 border-2 border-dashed border-red-700 text-red-700 cursor-pointer',
          dropZoneText: 'Drop here to delete',
        }),
      }
      this.dragDrop = createDragDropManager()
      this.formManager = createItemFormManager()

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
      this.items = items

      // Set up itemNav and boards
      this.itemNav = createItemNav(
        tour.itemNav
          .map((id) => items.find((i) => i._id === id))
          .filter(Boolean),
        items,
      )
      this.boards.items.arr = this.itemNav.itemNav
      // Stash=all not in nav, ToDelete=empty
      this.boards.stash.arr = items.filter(
        (item) =>
          !this.itemNav.itemNav.some((navItem) => navItem._id === item._id),
      )
      this.boards.toDelete.clear()

      // Current item index and form setup
      this.currentItemIdx = this.itemNav.itemNav.findIndex(
        (i) => i._id === itemId,
      )
      if (this.currentItemIdx < 0 && this.itemNav.itemNav.length)
        this.currentItemIdx = 0
      await this.loadItem(this.itemNav.itemNav[this.currentItemIdx]?._id)

      // Wire up event methods (satisfy Alpine use)
      Object.assign(this, {
        onDragStart: this._onDragStart.bind(this),
        onDragEnd: this._onDragEnd.bind(this),
        onDragOver: this._onDragOver.bind(this),
        onDragLeave: this._onDragLeave.bind(this),
        onDrop: this._onDrop.bind(this),
        onDropEmpty: this._onDropEmpty.bind(this),
        isDragging: this._isDragging.bind(this),
        isOver: this._isOver.bind(this),
        submitForm: this._submitForm.bind(this),
        upItems: () => this.itemNav.up(),
        downItems: () => this.itemNav.down(),
        resetItems: () => this.itemNav.reset(this.currentItemIdx),
        doView: (id) => this.itemNav.doView(id),
        saveItemNav: this._saveItemNav.bind(this),
        deleteItem: this._deleteItem.bind(this),
        loadItem: this.loadItem.bind(this),
        addItem: this._addItem.bind(this),
      })
    },

    getRefs() {
      if (!this.currentItem) return
      return this.items.filter((i) =>
        this.currentItem.refs?.some((rid) => i._id === rid),
      )
    },

    // Form and item load logic
    async loadItem(itemId) {
      if (!itemId) return
      let idx = this.itemNav.itemNav.findIndex((i) => i._id === itemId)
      if (idx !== -1) this.currentItemIdx = idx
      let cacheIdx = this.itemsCache.findIndex((i) => i._id === itemId)
      let item = this.itemsCache[cacheIdx]
      if (!item) {
        item = await getItem(itemId)
        this.itemsCache.push(item)
      }
      this.currentItem = item
      this.currentItemId = itemId
      this.formManager.populateFormData(item)
      if (!this.itemNav.itemNav.length && !this.boards.stash.arr.length) {
        this.boards.stash.add(item)
      }
    },

    async _submitForm() {
      await this.formManager.submitForm(this.itemsCache)
    },

    // Add item (simplified: creates blank/new form, does NOT POST until submit)
    _addItem() {
      this.currentItem = null
      this.currentItemId = null
      this.formManager.formData = structuredClone(
        this.formManager.emptyFormData,
      )
    },

    // Delete: move from any board to ToDelete
    _deleteItem(item) {
      for (const boardName of ['items', 'stash']) {
        let board = this.boards[boardName]
        if (board.arr.find((i) => i._id === item._id)) {
          board.remove(item)
          this.boards.toDelete.add(item)
          break
        }
      }
      // Reset form if needed
      if (item._id === this.formManager.formData._id) {
        this.formManager.formData = structuredClone(
          this.formManager.emptyFormData,
        )
      }
      // Load fallback item if available
      if (this.boards.items.length === 0 && this.items.length > 0) {
        let fallback = this.items.find(
          (i) => !this.boards.toDelete.arr.find((j) => j._id === i._id),
        )
        if (fallback) this.loadItem(fallback._id)
      } else if (this.boards.items.arr[0]) {
        this.loadItem(this.boards.items.arr[0]._id)
      }
    },

    async _saveItemNav() {
      try {
        await saveTour({
          _id: this.tour._id,
          itemNav: this.boards.items.arr.map((item) => item._id),
          items: Array.from(
            new Set([...this.items, ...this.boards.stash.arr]),
          ).map((i) => i._id),
        })
        for (const item of this.boards.toDelete.arr) {
          await deleteItem(item._id)
        }
        this.boards.toDelete.clear()
        alert('Modifiche salvate con successo.')
      } catch (e) {
        alert('Errore: ' + (e.message || 'unknown'))
      }
    },

    // === DRAG & DROP DELEGATION ===
    _onDragStart(board, idx) {
      this.dragDrop.onDragStart(board, idx)
    },
    _onDragEnd() {
      this.dragDrop.onDragEnd()
    },
    _onDragOver(board, idx, _event) {
      this.dragDrop.onDragOver(board, idx)
    },
    _onDragLeave(board, idx) {
      this.dragDrop.onDragLeave(board, idx)
    },

    _onDrop(board, idx, event) {
      if (
        !this.dragDrop.dragging ||
        this.dragDrop.draggingIdx === null ||
        this.dragDrop.draggingBoard === null
      )
        return
      if (
        this.dragDrop.draggingBoard === board &&
        this.dragDrop.draggingIdx === idx
      )
        return

      // Defensive: get source/target boards
      const src = this.boards[this.dragDrop.draggingBoard]
      const tgt = this.boards[board]
      // Remove from source
      const moved = src.arr.splice(this.dragDrop.draggingIdx, 1)[0]
      let insertIdx = idx
      const rect = event.target.getBoundingClientRect()
      if (event.clientY > rect.top + rect.height / 2) insertIdx++
      if (insertIdx > tgt.arr.length) insertIdx = tgt.arr.length
      tgt.arr.splice(insertIdx > idx ? insertIdx - 1 : insertIdx, 0, moved)
      this.dragDrop.onDragEnd()
    },

    _onDropEmpty(board, _event) {
      if (
        !this.dragDrop.dragging ||
        this.dragDrop.draggingIdx === null ||
        this.dragDrop.draggingBoard === null
      )
        return
      const src = this.boards[this.dragDrop.draggingBoard]
      const tgt = this.boards[board]
      const moved = src.arr.splice(this.dragDrop.draggingIdx, 1)[0]
      tgt.arr.push(moved)
      this.dragDrop.onDragEnd()
    },

    _isDragging(board, idx) {
      return this.dragDrop.isDragging(board, idx)
    },
    _isOver(board, idx) {
      return this.dragDrop.isOver(board, idx)
    },
  }))
})

window.Alpine = Alpine
Alpine.start()
