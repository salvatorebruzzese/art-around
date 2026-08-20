export function useBoard(name, initialArr = [], opts = {}) {
  // opts: {controls, dropZoneStyle, dropZoneText}
  return {
    name,
    arr: [...initialArr],
    controls: !!opts.controls,
    dropZoneStyle: opts.dropZoneStyle || '',
    dropZoneText: opts.dropZoneText || '',
    add(item) {
      this.arr.push(item)
    },
    remove(item) {
      const idx = this.arr.findIndex((el) => el._id === item._id)
      if (idx > -1) this.arr.splice(idx, 1)
    },
    move(idxFrom, idxTo) {
      const [item] = this.arr.splice(idxFrom, 1)
      this.arr.splice(idxTo, 0, item)
    },
    get length() {
      return this.arr.length
    },
    clear() {
      this.arr = []
    },
  }
}
