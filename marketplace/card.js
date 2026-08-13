export function makeCard(museum) {
  return `
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
  class="h-36 bg-p-soft/20 flex flex-col flexitems-center justify-center gap-4 px-6 border-t text-p-dark border-p-soft/50"
>
  <div class="flex flex-col font-sans">
    <h1 class="text-2xl text-p-medium">Nome visita/item</h1>
  <h2 class="text-md text-p-medium/50">${museum.name}</h2>
  </div>
  <div class="flex flex-row gap-4">
    <button class="shared-button-full">
      Apri
    </button>
    <button class="shared-button-full">
      Condividi
    </button>
  </div>
</div>
`
}
