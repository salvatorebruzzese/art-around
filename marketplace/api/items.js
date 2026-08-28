export async function getItemsByTour(tourId) {
  const res = await fetch(`/api/items?tour=${tourId}`)
  if (!res.ok) throw new Error('Items fetch failed')
  return await res.json()
}

export async function getItem(itemId) {
  const res = await fetch(`/api/items/${itemId}`)
  if (!res.ok) throw new Error('Item fetch failed')
  return await res.json()
}

export async function saveItemPromise(data) {
  const method = data._id ? 'PATCH' : 'POST'
  const url = data._id ? `/api/items/${data._id}` : '/api/items'
  return fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}
export async function saveItem(data) {
  let res = await saveItemPromise(data)
  if (!res.ok) throw res
  return await res.json()
}

export async function deleteItem(itemId) {
  const res = await fetch(`/api/items/${itemId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Delete failed')
}
