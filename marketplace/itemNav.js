export function createItemNav(itemNav, items) {
  return {
    itemNav,
    items,
    ghostIdx: 2,
    itd: 4, // items to display

    get currentCap() {
      return this.itemNav.length - 1
    },

    doView(id) {
      const idx = this.itemNav.findIndex((i) => i._id === id)
      const { ghostIdx, itd, currentCap } = this
      if (ghostIdx <= 1) {
        return idx >= 0 && idx <= itd - 1
      }
      if (ghostIdx >= currentCap - 2) {
        return idx >= currentCap - 3 && idx <= currentCap
      }
      return (
        Math.abs(idx - ghostIdx) <= 2 &&
        idx >= ghostIdx - 2 &&
        idx <= ghostIdx + 1
      )
    },

    up() {
      if (this.ghostIdx > this.itd / 2) this.ghostIdx--
    },
    down() {
      if (this.ghostIdx < this.itemNav.length - 3) this.ghostIdx++
    },
    reset(currentIdx) {
      this.ghostIdx = currentIdx
    },
  }
}
