import { saveItem } from './api/items.js'

export function createItemFormManager(emptyFormData = null) {
  return {
    formData: emptyFormData
      ? structuredClone(emptyFormData)
      : {
          _id: null,
          name: '',
          tour: '',
          license: '',
          explanations: [{ level: '', text: '', duration: 0 }],
        },
    isSubmitting: false,
    emptyFormData: emptyFormData || {
      _id: null,
      name: '',
      tour: '',
      license: '',
      explanations: [{ level: '', text: '', duration: 0 }],
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
                  duration: 0, // Placeholder; customize if you have duration data
                },
              ]
            : [
                {
                  level: '',
                  text: '',
                  duration: 0,
                },
              ],
      }
    },

    async submitForm(itemsCache) {
      this.isSubmitting = true
      // Remove cached version, if any
      const idx = itemsCache.findIndex((i) => i._id === this.formData._id)
      if (idx > -1) itemsCache.splice(idx, 1)

      try {
        await saveItem(this.formData)
        this.isSubmitting = false
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
  }
}
