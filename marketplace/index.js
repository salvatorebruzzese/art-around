const container = document.getElementById('item-container')

const cardHtml = `
<div
  class="flex-1 relative overflow-hidden bg-gradient-to-br from-p-light to-p-soft/20"
>
  <img
    src="https://dummyimage.com/600x400/efefef/a3a3a3.jpg&text=Image+Not+Found"
    alt="Thumbnail not found"
    class="absolute inset-0 w-full h-full object-cover mix-blend-multiply"
  />

  <!-- Dropdown Menu Tre Punti -->
  <div class="absolute top-3 right-3 z-10">
    <details class="dropdown dropdown-end">
      <summary
        class="btn btn-sm btn-circle bg-white/80 hover:bg-white text-p-dark border-none shadow-md backdrop-blur-sm focus:outline-none list-none"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z"
          />
        </svg>
      </summary>
      <ul
        class="p-2 shadow-lg menu dropdown-content bg-white rounded-xl w-40 text-p-dark font-sans text-sm border border-p-soft/40 mt-1"
      >
        <li><a class="hover:bg-p-soft/20 rounded-lg">Modifica visita</a></li>
        <li>
          <a class="hover:bg-p-soft/20 rounded-lg">Modifica item</a>
        </li>
        <li>
          <a class="hover:bg-p-soft/20 rounded-lg text-error">Elimina</a>
        </li>
      </ul>
    </details>
  </div>
</div>
<div
  class="h-24 bg-p-soft/30 flex items-center justify-center gap-4 px-6 border-t border-p-soft/50"
>
  <button
    class="h-10 flex-1 bg-white text-p-medium border border-p-medium rounded-xl font-sans font-medium text-sm hover:bg-p-soft transition-all duration-150 active:scale-95 shadow-sm"
  >
    Apri
  </button>
  <button
    class="h-10 flex-1 bg-white text-p-medium border border-p-medium rounded-xl font-sans font-medium text-sm hover:bg-p-soft transition-all duration-150 active:scale-95 shadow-sm"
  >
    Condividi
  </button>
</div>
`
const decorator = `w-full h-80 rounded-3xl flex flex-col overflow-hidden shadow-lg border border-p-soft bg-white group hover:-translate-y-1 hover:shadow-xl transition-all duration-300`

async function addCard() {
  if (container === null) return
  const card = document.createElement('div')
  card.className = decorator
  card.innerHTML = cardHtml
  container.appendChild(card)
}

for (let i = 0; i < 20; i++) {
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

  /**
   * @param {string} selected
   */
  function setActive(selected) {
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
