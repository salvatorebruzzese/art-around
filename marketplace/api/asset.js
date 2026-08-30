export async function loadAsset(file, publicity, user, tour, id = null) {
  const formData = new FormData()
  formData.append('author', user._id)
  formData.append('tour', tour._id)
  formData.append('data', file) // the raw File, not the Blob or a Data URL
  formData.append('datatype', file.type)
  formData.append('public', publicity)

  return fetch('/api/assets' + (id ? '/' + id : ''), {
    method: id ? 'PATCH' : 'POST',
    body: formData,
  })
}

/*payload
 *
 *
  const toBinaryBlob = (file) =>

    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const arrayBuffer = reader.result
        const blob = new Blob([arrayBuffer], { type: file.type })
        resolve(blob)
      }
      reader.onerror = (error) => reject(error)
      reader.readAsArrayBuffer(file)
    })

  const dataBlob = await toBinaryBlob(file)

  const payload = {
    author: user._id,
    tour: tour._id,
    data: dataBlob,
    datatype: file.type,
    public: publicity,
  }

  console.log(payload)
  // Send the asset to the backend
  return fetch('/api/assets' + (id ? '/' + id : ''), {
    method: id ? 'PATCH' : 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
 **/
