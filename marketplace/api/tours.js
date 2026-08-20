export async function getTour(tourId) {
  const res = await fetch(`/api/tours/${tourId}`)
  if (!res.ok) throw new Error('Tour not found')
  return await res.json()
}

export async function saveTour({ _id, itemNav, items }) {
  const res = await fetch(`/api/tours/${_id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemNav, items }),
  })
  if (!res.ok) throw new Error('Tour save failed')
  return await res.json()
}
