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

export async function loadImage(file, publicity, user, tour, id = null) {
  const miniatureRes = await loadMiniature(file, publicity, user, tour, id)
  if (miniatureRes.ok) {
    const miniatureObj = await miniatureRes.json()
    const formData = new FormData()
    formData.append('author', user._id)
    formData.append('tour', tour._id)
    formData.append('data', file) // the raw File, not the Blob or a Data URL
    formData.append('datatype', file.type)
    formData.append('public', publicity)
    formData.append('miniature', miniatureObj._id)

    return fetch('/api/assets' + (id ? '/' + id : ''), {
      method: id ? 'PATCH' : 'POST',
      body: formData,
    })
  } else {
    // TODO: throw error
    console.log('Error: failed to load miniature', miniatureRes)
    return miniatureRes
  }
}

async function loadMiniature(file, publicity, user, tour, id = null) {
  const miniatureBlob = await resizeImage(file, 300, 300)
  const miniatureFile = new File([miniatureBlob], 'mini-' + file.name, {
    type: miniatureBlob.type,
  })
  return loadAsset(miniatureFile, publicity, user, tour, id)
}

function resizeImage(file, maxWidth, maxHeight, quality = 0.5) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function (e) {
      const img = new Image()
      img.onload = function () {
        let width = img.width
        let height = img.height
        if (width > height) {
          if (width > maxWidth) {
            height = height * (maxWidth / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = width * (maxHeight / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            // blob is the resized image
            resolve(blob)
          },
          file.type,
          quality,
        )
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
