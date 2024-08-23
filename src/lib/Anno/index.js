import { Assets, Sprite, Application, Container, Point } from 'pixi.js'
import LabelAnno from './Label'

class Anno {
  constructor() {
    this.app = undefined
    // 标注框信息
    this.annoLabelList = []
    // 标注的列表
    this.labelList = []
    this.scale = 1
    this.imgHeight = 0
    this.imgWidth = 0
    this.domWidth = 0
    this.domHeight = 0
    this.container = undefined

    // 临时记录坐标用
    this._temp = {
      start: { x: 0, y: 0 },
      end: { x: 0, y: 0 }
    }
    //
    this._tempAnnoLabel = null

    this.mode = 'NONE' // NONE
  }

  get selectedAnnoLabel() {
    return this.annoLabelList.find((i) => i.selected)
  }

  async init(dom) {
    const app = new Application()
    this.domWidth = dom.clientWidth
    this.domHeight = dom.clientHeight
    await app.init({ background: '#1099bb', resizeTo: dom })
    dom.appendChild(app.canvas)
    app.view.addEventListener('contextmenu', (event) => {
      event.preventDefault() // 阻止默认的右键菜单
    })
    this.app = app
  }

  async loadImage() {
    if (this.container) {
      this.container.destroy()
    }
    this.container = new Container({
      // isRenderGroup: true
    })

    this.initEvents()
    const texture = await Assets.load('imgs/test.png')
    this.imgWidth = texture.width
    this.imgHeight = texture.height

    const sprite = new Sprite(texture)
    this.container.addChild(sprite)
    this.app.stage.addChild(this.container)

    const scale = Math.min(this.domWidth / this.imgWidth, this.domHeight / this.imgHeight)
    this.scaleTo(scale)
  }

  // 加载标注信息
  load(list) {
    // 根据当前anno的信息，全部更新
    this.labelList = list
    for (var label of this.labelList) {
      const labelAnno = new LabelAnno(label, this)
      this.annoLabelList.push(labelAnno)
    }
  }

  scaleTo(x) {
    this.scale = x
    this.container.scale = this.scale
    this.annoLabelList.forEach((annoLabel) => {
      annoLabel.draw(x)
    })
  }

  // 初始化事件
  initEvents() {
    // 初始化新增框
    this.container.eventMode = 'dynamic'

    this.container.on('mousedown', (event) => {
      event.originalEvent.preventDefault()
      const { x, y } = event.global
      this._temp.start = { x, y }
      if (event.originalEvent.altKey) {
        // 按照alt，则拖动
        this.onMoveStageStart()
      } else if (event.originalEvent.shiftKey) {
        // 按照shift，则新增
        this.onAddLabelStart(event)
      } else if (this.selectedAnnoLabel?.showResize) {
        this.onResizeStart()
      } else {
        this.onSelectLabel({ x, y })
      }
    })

    this.container.on('mousemove', (event) => {
      this.setCursorStyle(event)
      const _this = this
      event.originalEvent.preventDefault()
      const { x, y } = event.global
      if (this.mode === 'DRAG') {
        _this.onMoveStageMove({ x, y })
      } else if (this.mode === 'ADD') {
        this.onAddLabelMove(event)
      } else if (this.mode === 'SELECT') {
        this.onMoveAnnoLabel(event)
      } else if (this.mode === 'RESIZE') {
        this.onResizeMove(event)
      }
    })

    this.container.on('mouseup', (event) => {
      const { x, y } = event.global
      this._temp.end = { x, y }

      if (this.mode === 'DRAG') {
        this.onMoveStageEnd()
      } else if (this.mode === 'ADD') {
        this.onAddLabelEnd()
      } else if (this.mode === 'SELECT') {
        this.onMoveAnnoLabelEnd()
      } else if (this.mode === 'RESIZE') {
        this.onResizeEnd()
      }
    })
  }

  //
  onResizeStart() {
    this.mode = 'RESIZE'
  }

  onResizeMove(e) {
    const pos = this.container.toLocal(e.global)
    const xmax = pos.x
    const ymax = pos.y
    this.selectedAnnoLabel.width = xmax - this.selectedAnnoLabel.xmin
    this.selectedAnnoLabel.height = ymax - this.selectedAnnoLabel.ymin
    this.selectedAnnoLabel.draw()
  }

  onResizeEnd() {
    this.selectedAnnoLabel.resizing = false
    this.mode = 'NONE'
  }

  // 新增标签框
  onAddLabelStart(e) {
    const xmin = e.global.x / this.scale
    const ymin = e.global.y / this.scale
    this._tempAnnoLabel = new LabelAnno(
      { xmin: xmin, ymin: ymin, xmax: xmin + 10, ymax: ymin + 10, desc: '红球' },
      this
    )
    this.mode = 'ADD'
  }

  onAddLabelMove(e) {
    const xmax = e.global.x / this.scale
    const ymax = e.global.y / this.scale
    this._tempAnnoLabel.width = xmax - this._tempAnnoLabel.xmin
    this._tempAnnoLabel.height = ymax - this._tempAnnoLabel.ymin
    this._tempAnnoLabel.draw()
  }
  // 新增标签框
  onAddLabelEnd() {
    const { xmin, ymin, width, height } = this._tempAnnoLabel
    const xmax = xmin + width
    const ymax = ymin + height
    const newAnnoLabel = new LabelAnno({ xmin, ymin, xmax, ymax, desc: '红球' }, this)
    this.annoLabelList.push(newAnnoLabel)
    this._tempAnnoLabel.destroy()
    this.mode = 'NONE'
  }

  // 放大
  onZoomIn() {
    this.scale *= 0.9
    this.scaleTo(this.scale)
  }
  // 缩小
  onZoomOut() {
    this.scale *= 1.1
    this.scaleTo(this.scale)
  }

  onMoveStageStart() {
    this.mode = 'DRAG'
  }

  onMoveStageMove({ x, y }) {
    this.container.x = this.container.x - this._temp.start.x + x
    this.container.y = this.container.y - this._temp.start.y + y
    this._temp.start = { x, y }
  }

  onMoveStageEnd() {
    this.container.x = this.container.x - this._temp.start.x + this._temp.end.x
    this.container.y = this.container.y - this._temp.start.y + this._temp.end.y
    this.mode = 'NONE'
  }

  onSelectLabel(pos) {
    const { x, y } = this.container.toLocal(pos)
    const point = new Point(x, y)
    var flag = false
    for (var annoLabel of this.annoLabelList) {
      if (!flag && annoLabel.rect.containsPoint(point)) {
        annoLabel.selected = true
        flag = true
        this.mode = 'SELECT'
      } else {
        annoLabel.selected = false
      }
    }
  }
  onMoveAnnoLabel(e) {
    this._temp.end = { x: e.global.x, y: e.global.y }
    const { xmin, ymin } = this.selectedAnnoLabel
    this.selectedAnnoLabel.xmin = xmin + (this._temp.end.x - this._temp.start.x) / this.scale
    this.selectedAnnoLabel.ymin = ymin + (this._temp.end.y - this._temp.start.y) / this.scale
    this._temp.start = { x: e.global.x, y: e.global.y }
    this.selectedAnnoLabel.draw()
  }

  onMoveAnnoLabelEnd() {
    this.mode = 'NONE'
  }

  setCursorStyle(event) {
    const threshold = 20
    if (!this.selectedAnnoLabel) {
      this.app.view.style.cursor = 'default'
      return
    }
    // 判断当前光标是否为附近区域
    const xmax = this.selectedAnnoLabel.xmin + this.selectedAnnoLabel.width
    const ymax = this.selectedAnnoLabel.ymin + this.selectedAnnoLabel.height
    const { x, y } = this.container.toLocal(event.global)
    if (Math.abs(xmax - x) > threshold || Math.abs(ymax - y) > threshold) {
      this.app.view.style.cursor = 'default'
      this.selectedAnnoLabel.showResize = false
      return
    }
    this.app.view.style.cursor = 'se-resize'
    this.selectedAnnoLabel.showResize = true
  }
}

export default new Anno()
