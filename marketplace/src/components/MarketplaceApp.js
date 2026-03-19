class MarketplaceApp extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <h1 class="text-4xl font-bold text-gray-900">Art Around</h1>
        <p class="text-xl text-gray-600">Marketplace</p>
        <p class="text-gray-500">Hello World</p>
        <a href="/navigator" class="text-blue-600 underline">Go to Navigator →</a>
      </div>
    `
  }
}

customElements.define('marketplace-app', MarketplaceApp)
