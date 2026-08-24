export class BoardManager {
  dragging
  draggingIdx
  draggingBoard
  overIdx
  overBoard
  dragAccepted
  constructor() {
    this.dragging = null
    this.dragAccepted = false
    this.draggingIdx = null
    this.draggingBoard = null
    this.overIdx = null
    this.overBoard = null
  }
  onDragStart(board, item, idx) {
    this.draggingBoard = board
    this.dragging = item
    this.draggingIdx = idx
    this.overIdx = null
    this.overBoard = null
  }

  onDragEnd() {
    if (this.draggingBoard?.arrManager && this.dragAccepted) {
      this.draggingBoard.arrManager.del(this.draggingIdx)
    }
    this.dragging = null
    this.dragAccepted = false
    this.draggingIdx = null
    this.draggingBoard = null
    this.overIdx = null
    this.overBoard = null
  }

  onDragOver(board, idx) {
    if (
      this.dragging !== null &&
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
    this._arr.splice(idx + 1, 0, item)
  }
  get(idx) {
    return this._arr.at(idx)
  }
  del(idx) {
    return this._arr.splice(idx, 1)[0]
  }
  clear() {
    this._arr = []
  }
  get arr() {
    return this._arr
  }
  get length() {
    return this._arr.length
  }
}

export class refsArrManager extends defaultArrManager {
  _arr
  ctx
  constructor(ctx) {
    super()
    this.ctx = ctx
    this._arr = {}
    if (ctx.currentItemId) this._arr[ctx.currentItemId] = []
  }
  add(i) {
    if (!this.ctx.currentItemId) return
    if (this._arr[this.ctx.currentItemId])
      this._arr[this.ctx.currentItemId].push(i)
    else {
      this._arr[this.ctx.currentItemId] = [i]
    }
  }
  get(idx) {
    return this._arr[this.ctx.currentItemId].at(idx)
  }
  put(i, idx) {
    if (!this.ctx.currentItemId) return
    if (this._arr[this.ctx.currentItemId])
      this._arr[this.ctx.currentItemId].splice(idx, 0, i)
    else {
      this._arr[this.ctx.currentItemId] = [i] // hmm what?
    }
  }
  del(idx) {
    if (!this.ctx.currentItemId) return null
    return this._arr[this.ctx.currentItemId]?.splice(idx, 1)[0]
  }
  clear() {
    if (!this.ctx.currentItemId) return null
    this._arr[this.ctx.currentItemId] = []
  }
  get arr() {
    if (!this.ctx.currentItemId) return []
    if (!this._arr[this.ctx.currentItemId]) return []
    return this._arr[this.ctx.currentItemId]
  }
  get length() {
    if (!this.ctx.currentItemId || !this._arr[this.ctx.currentItemId]) return 0
    return this._arr[this.ctx.currentItemId].length
  }
}
export class Board {
  _doControls
  _name
  _arrMgr
  _boardMgr
  _defaultArrMgr = new defaultArrManager()
  nextFocus = null
  dropZoneStyle
  dropZoneText
  constructor(name, boardMgr, params = {}) {
    this._name = name
    this._boardMgr = boardMgr
    this._doControls = params.doControls ? params.doControls : false
    this._arrMgr = params.arrManager ? params.arrManager : this._defaultArrMgr
    this.dropZoneStyle = params.dropZoneStyle ? params.dropZoneStyle : ''
    this.dropZoneText = params.dropZoneText ? params.dropZoneText : ''
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

  isOver(idx) {
    this._boardMgr.isOver(this, idx)
  }
  onDragOver(idx, event) {
    return this._boardMgr.onDragOver(this, idx, event)
  }
  onDragLeave(idx) {
    return this._boardMgr.onDragLeave(this, idx)
  }
  isDragging(idx) {
    return this._boardMgr.isDragging(this, idx)
  }
  onDragStart(idx, event) {
    let rem = this._arrMgr.get(idx)
    let img = event.target.closest('.reordItem')
    event.dataTransfer.setDragImage(img ? img : event.target, 10, 40)
    this._boardMgr.onDragStart(this, rem, idx)
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
    this._boardMgr.dragAccepted = true
    // this.nextFocus = dragging // ptr
  }

  onDropEmpty(event) {
    const dragging = this._boardMgr.dragging
    const draggingIdx = this._boardMgr.draggingIdx
    const draggingBoard = this._boardMgr.draggingBoard
    const arrMgr = this._arrMgr

    if (!dragging || draggingIdx === null || draggingBoard === null) return

    if (arrMgr.length == 0) {
      arrMgr.add(dragging)
    } else {
      const rect = event.target.getBoundingClientRect()
      const middle = rect.top + rect.height / 2
      let insertIdx = event.clientY < middle ? 0 : arrMgr.length
      arrMgr.put(dragging, insertIdx)
    }
    this._boardMgr.dragAccepted = true
  }
}
