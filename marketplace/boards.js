export class BoardManager {
  dragging
  draggingIdx
  draggingBoard
  overIdx
  overBoard
  constructor() {
    this.dragging = null
    this.draggingIdx = null
    this.draggingBoard = null
    this.overIdx = null
    this.overBoard = null
  }
  onDragStart(board, item, idx) {
    this.dragging = item
    this.draggingIdx = idx
    this.draggingBoard = board
    this.overIdx = null
    this.overBoard = null
  }

  onDragEnd() {
    this.dragging = null
    this.draggingIdx = null
    this.draggingBoard = null
    this.overIdx = null
    this.overBoard = null
  }

  onDragOver(board, idx) {
    if (
      this.dragging &&
      (this.draggingBoard !== board || this.draggingIdx !== idx)
    ) {
      this.overIdx = idx
      this.overBoard = board
    }
  }

  onDragLeave(board, idx) {
    if (this.overBoard === board && this.overIdx === idx) {
      this.overIdx = null
      this.overBoard = null
    }
  }

  isDragging(board, idx) {
    return (
      this.dragging && this.draggingBoard === board && this.draggingIdx === idx
    )
  }

  isOver(board, idx) {
    return (
      this.overBoard === board &&
      this.overIdx === idx &&
      this.dragging &&
      !(this.draggingBoard === board && this.draggingIdx === idx)
    )
  }
}

export class defaultArrManager {
  _arr = []
  add(item) {
    this._arr.push(item)
  }
  put(item, idx) {
    this._arr.splice(idx, 0, item)
  }
  del(idx) {
    return this._arr.splice(idx, 1)
  }
  clear() {
    this._arr = []
  }
  get arr() {
    return [...this._arr] // NOTE: a copy!!!
  }
  get length() {
    return this._arr.length
  }
}

export class Board {
  _doControls
  _name
  _arrMgr
  _boardMgr
  _defaultArrMgr = new defaultArrManager()
  constructor(name, boardMgr, params = {}) {
    this._name = name
    this._boardMgr = boardMgr
    this._doControls = params.doControls ? params.doControls : false
    this._arrMgr = params.arrManager ? params.arrManager : this._defaultArrMgr
  }
  get name() {
    return this._name
  }
  get doControls() {
    return this._doControls
  }

  get arr() {
    return this._arrMgr.arr
  }
  get arrManager() {
    return this._arrMgr
  }

  onDragStart(idx) {
    this._boardMgr.onDragStart(this, this._arrMgr.del(idx), idx)
  }

  onDragEnd() {
    this._boardMgr.onDragEnd()
  }
  onDrop(idx, event) {
    const dragging = this._boardMgr.dragging
    const draggingIdx = this._boardMgr.draggingIdx
    const draggingBoard = this._boardMgr.draggingBoard
    const arrMgr = this._arrMgr
    if (!dragging || draggingIdx === null || draggingBoard === null) return
    if (draggingBoard === this && draggingIdx === idx) return

    let insertIdx = idx
    const rect = event.target.getBoundingClientRect()
    if (event.clientY > rect.top + rect.height / 2) insertIdx++
    if (insertIdx > arrMgr.length) insertIdx = arrMgr.length
    arrMgr.put(dragging, insertIdx > idx ? insertIdx - 1 : insertIdx)
    this.dragDrop.onDragEnd()
  }

  onDropEmpty(event) {
    const dragging = this._boardMgr.dragging
    const draggingIdx = this._boardMgr.draggingIdx
    const draggingBoard = this._boardMgr.draggingBoard
    const arrMgr = this._arrMgr

    if (!dragging || draggingIdx === null || draggingBoard === null) return

    if (arrMgr.length == 0) arrMgr.add(dragging)
    else {
      const rect = event.target.getBoundingClientRect()
      const middle = rect.top + rect.height / 2
      insertIdx = event.clientY < middle ? 0 : arrMgr.length
      arrMgr.put(dragging, insertIdx)
    }
    this._boardMgr.onDragEnd()
  }
}
