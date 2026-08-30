import { TourNavigation } from './tourNav'
import Alpine from 'alpinejs'
import { saveItem, saveItemPromise } from '../marketplace/api/items'
import { saveTour } from '../marketplace/api/tours'
import { loadAsset } from './api/asset.js'

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
            await super.initByURL()
          } catch (e) {
            console.log('Err by URL', e)
          }
        }

        async saveItem(data) {
          console.log(data)
          try {
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
      })(),
  )
})

window.Alpine = Alpine
Alpine.start()
