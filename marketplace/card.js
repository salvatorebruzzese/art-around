window.selectTour = function (tourId) {
  localStorage.setItem('wasVisitChosen', 'true')
  localStorage.setItem('selectedTourId', tourId)
  window.location.href = '../navigator/'
}

window.makeStaticCard = async function makeStaticCard(tour) {
  const response = await fetch('/api/museums/' + tour.museum)
  const museum = await response.json()
  const museumName = museum.name
  return `
<div
  id="${tour._id}"
  class="flex-1 relative overflow-hidden bg-gradient-to-br from-p-light to-p-soft/20"
>
  <img
    src="/api/assets/${tour.thumbnail}"
    alt="Thumbnail not found"
    class="absolute inset-0 w-full h-full object-cover mix-blend-multiply"
  />

  <!-- Dropdown Menu Tre Punti -->
  <div class="absolute top-3 right-3 z-10">
    <div x-data="{open:false}" class="dropdown dropdown-end">
      <button @click="open = !open"
        class="btn btn-sm btn-circle bg-white/80 hover:bg-white text-p-dark border-none shadow-md backdrop-blur-sm focus:outline-none list-none"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z"
          />
        </svg>
      </button>
      <div x-show="open" @click.outside="open = false">
      <ul class="nav-dropdown-menu p-2">
        <li><a class="shared-button-flex-secondary shadow-none">Condividi</a></li>
        <li><a class="shared-button-flex-warning shadow-none">Elimina</a></li>
      </ul>
      </div>
    </div>
  </div>
</div>
<div
  class="h-36 bg-p-soft/20 flex flex-col justify-center gap-4 px-6 border-t text-p-dark border-p-soft/50"
>
  <div class="flex flex-col font-sans">
    <h1 class="text-2xl text-p-medium truncate">${tour.name}</h1>
    <h2 class="text-md text-p-medium/50 truncate">${museumName}</h2>
  </div>
  <div class="flex gap-4">
    <!-- Use inline onclick calling window.selectTour -->
    <button class="shared-button-full" onclick="selectTour('${tour._id}')">
      Apri
    </button>
    <button class="shared-button-full">
      Modifica
    </button>
  </div>
</div>
`
}
