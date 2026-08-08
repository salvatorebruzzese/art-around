const container = document.getElementById('item-container')

async function addCard() {
  if (container === null) return
  const card = document.createElement('div')
  const cardHtml = await fetch('card.html')
  card.className =
    'w-full h-80 rounded-3xl flex flex-col overflow-hidden shadow-lg border border-p-soft bg-white group hover:-translate-y-1 hover:shadow-xl transition-all duration-300'
  card.innerHTML = await cardHtml.text()
  container.appendChild(card)
}

for (let i = 0; i < 10; i++) {
  addCard()
}

// Gestione Toggle Switch
document.addEventListener('DOMContentLoaded', () => {
  const toggleContainer = document.getElementById('toggle-switch')
  if (!toggleContainer) return

  const buttons = toggleContainer.querySelectorAll('button')
  if (buttons.length < 2) return

  const btnVisite = buttons[0]
  const btnItem = buttons[1]

  const activeClasses = ['bg-p-medium', 'text-white', 'shadow-sm']
  const inactiveClasses = [
    'bg-transparent',
    'text-p-medium',
    'hover:bg-p-soft/20',
  ]

  function setActive(selected: string) {
    if (selected === 'VISITE') {
      btnVisite.classList.remove(...inactiveClasses)
      btnVisite.classList.add(...activeClasses)

      btnItem.classList.remove(...activeClasses)
      btnItem.classList.add(...inactiveClasses)
    } else {
      btnItem.classList.remove(...inactiveClasses)
      btnItem.classList.add(...activeClasses)

      btnVisite.classList.remove(...activeClasses)
      btnVisite.classList.add(...inactiveClasses)
    }
  }

  btnVisite.addEventListener('click', () => setActive('VISITE'))
  btnItem.addEventListener('click', () => setActive('ITEM'))
})
