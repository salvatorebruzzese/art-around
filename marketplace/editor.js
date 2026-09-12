import { TourNavigation } from './tourNav'
import Alpine from 'alpinejs'
import {
  saveItem,
  saveItemPromise,
  deleteItem as apiDeleteItem,
} from '../marketplace/api/items'
import { saveTour } from '../marketplace/api/tours'
import { loadAsset, loadImage } from './api/asset.js'

import './userManager.js'
import './quick-nav.js'
import './Overlay.js'

document.addEventListener('alpine:init', () => {
  Alpine.data(
    'editorState',
    () =>
      new (class extends TourNavigation {
        async init() {
          try {
            const url = new URL(window.location.href)
            // /marketplace/editor/<tourId>?museum=<museumId>?item=<itemId>
            let tourId = url.pathname.split('/').filter(Boolean).at(2)
            let itemId = url.searchParams.get('item')
            const museumId = url.searchParams.get('museum')
            if (tourId == 'new') {
              const user = await Alpine.store('userManager').getUser()
              // we want a new tour (i.e. valid _id)
              // so we quickly create one
              const newTour = await (async () => {
                const res = await fetch(`/api/tours/`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: 'Nuovo tour',
                    author: user._id,
                    items: [],
                    itemNav: [],
                    museum: museumId,
                    price: 0,
                    description: '',
                    quiz: { questions: [] },
                  }),
                })
                if (!res.ok) throw new Error('Tour save failed')
                return await res.json()
              })()

              const newItem = {
                _id: null,
                name: 'Nuovo item',
                itemAuthor: user._id || null,
                tour: newTour._id,
                explanations: [
                  {
                    level: 'simple',
                    text: 'Inserire una spiegazione.',
                    durationSeconds: 0,
                  },
                ],
                license: '',
                refs: [],
              }

              const item = await saveItem(newItem)
              tourId = newTour._id
              itemId = item._id
              window.location.href = `/marketplace/editor/${tourId}?item=${itemId}`
            } else {
              await this.initialize(tourId, itemId)
            }
          } catch (e) {
            console.log(e)
            // alert(e)
            // history.back()
          }
        }

        async saveItem(data) {
          try {
            if (typeof data._id === 'number') {
              data._id = null
            }
            await saveItem(data)
            alert('Modifiche salvete con successo!')
          } catch (e) {
            // TODO: handle error types
            // default/db:
            alert('An error occurred.')
            console.log('Error', await e.json())
          }
        }

        async saveItemsAndTour() {
          try {
            let newItems = await Promise.all(
              Object.entries(this.items).map(async ([id, i]) => {
                if (typeof id === 'number') i._id = null // new item
                return saveItemPromise(i).then((r) => (r.ok ? r.json() : null))
              }),
            )
            // Only keep valid objects
            this.items = {}
            newItems.filter(Boolean).forEach((i) => {
              this.items[i._id] = i
            })

            saveTour({
              _id: this.tour._id,
              itemNav: this.itemNav,
              items: Object.values(this.items).map((i) => i._id), // arr of ids
              // will be extended
            })
            alert('Modifiche salvate con successo!')
          } catch (e) {
            console.log(e, e.message)
          }
        }

        async loadAsset(file, publicity, user, tour, id = null) {
          try {
            const res = await loadAsset(file, publicity, user, tour, id)
            console.log('asset upload: ', res)
            return res
          } catch (e) {
            console.log(e, e.message)
          }
        }

        async loadImage(file, publicity, user, tour, id = null) {
          try {
            const res = await loadImage(file, publicity, user, tour, id)
            return res
          } catch (e) {
            console.log(e, e.message)
          }
        }

        async deleteItem(id, contextArr = null, idx = null) {
          try {
            // REVIEW: dead code?
            // Remove from sidebar/list
            if (contextArr && typeof idx === 'number') {
              contextArr.splice(idx, 1)
            }

            // Remove from this.items
            if (this.items[id]) {
              // If backend id, call API
              if (this.items[id]._id) {
                await apiDeleteItem(this.items[id]._id)
              }
              // NOTE: before we need to remove from other lists
              // Remove from all lists that may reference it
              if (Array.isArray(this.itemNav)) {
                console.log(this.itemNav)
                this.itemNav = this.itemNav.filter((eid) => eid != id)
                console.log(this.itemNav)
              }

              // Remove from refs in all items (handle gracefully)
              Object.values(this.items).forEach((it) => {
                if (Array.isArray(it.refs)) {
                  it.refs = it.refs.filter((refId) => refId != id)
                }
              })

              // Update selection if needed
              if (this.selectedId === id) {
                const itemIds = Object.keys(this.items)
                this.selectedId = itemIds.length ? itemIds[0] : null
              }
              delete this.items[id]
            }
          } catch (e) {
            alert(
              "Errore durante l'eliminazione: " +
                (e && e.message ? e.message : e),
            )
          }
        }
      })(),
  )
})

window.Alpine = Alpine
Alpine.start()
