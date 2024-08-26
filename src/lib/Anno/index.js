import { Assets, Sprite, Application, Container, Point } from 'pixi.js'
import LabelAnno from './Label'

class Anno {
  constructor() {
    this.app = undefined
    // 标注框信息
    this.labelAnnoList = []
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
    this._tempLabelAnno = null

    this.mode = 'NONE' // NONE
  }

  get selectedLabelAnno() {
    return this.labelAnnoList.find((i) => i.selected)
  }

  async init(dom) {
    const app = new Application()
    this.domWidth = dom.clientWidth
    this.domHeight = dom.clientHeight
    await app.init({ background: '#1099bb', resizeTo: dom })
    dom.appendChild(app.canvas)
    app.canvas.addEventListener('contextmenu', (event) => {
      event.preventDefault() // 阻止默认的右键菜单
    })
    this.app = app
  }

  async loadImage(url) {
    if (this.container) {
      this.container.destroy()
    }
    this.container = new Container({
      // isRenderGroup: true
    })

    const texture = await Assets.load(url)
    this.imgWidth = texture.width
    this.imgHeight = texture.height
    const sprite = new Sprite(texture)
    this.container.addChild(sprite)
    this.app.stage.addChild(this.container)
    const scale = Math.min(this.domWidth / this.imgWidth, this.domHeight / this.imgHeight)
    this.scaleTo(scale)
  }

  // 加载标注信息
  async load(img, list) {
    await this.loadImage(img)
    // 根据当前anno的信息，全部更新
    this.labelList = list
    for (var label of this.labelList) {
      const labelAnno = new LabelAnno(label, this)
      this.labelAnnoList.push(labelAnno)
    }

    this.initEvents()
  }

  updateDesc(desc) {
    if (!this.selectedLabelAnno) return
    this.selectedLabelAnno.desc = desc
    this.selectedLabelAnno.draw()
  }

  scaleTo(x) {
    this.scale = x
    this.container.scale = this.scale
    this.labelAnnoList.forEach((labelAnno) => {
      labelAnno.draw(x)
    })
  }

  getLabelAnnoInfo() {
    return this.labelAnnoList.map((i) => i.getAnnoInfo())
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
      } else if (this.selectedLabelAnno?.showResize) {
        this.onResizeStart()
      } else {
        this.onSelectLabel({ x, y })
      }
    })

    this.container.on('mousemove', (event) => {
      const { x, y } = event.global
      this.setCursorStyle(event)
      const _this = this
      event.originalEvent.preventDefault()

      if (this.mode === 'DRAG') {
        _this.onMoveStageMove({ x, y })
      } else if (this.mode === 'ADD') {
        this.onAddLabelMove(event)
      } else if (this.mode === 'SELECT') {
        this.onMoveLabelAnno(event)
      } else if (this.mode === 'RESIZE') {
        this.onResizeMove(event)
      }
    })

    this.container.on('mouseup', () => this.triggerMouseUp())
    this.container.on('mouseleave', () => this.triggerMouseUp())
  }

  onResizeStart() {
    this.mode = 'RESIZE'
  }

  onResizeMove(e) {
    const pos = this.container.toLocal(e.global)
    const xmax = pos.x
    const ymax = pos.y
    this.selectedLabelAnno.width = xmax - this.selectedLabelAnno.xmin
    this.selectedLabelAnno.height = ymax - this.selectedLabelAnno.ymin
    this.selectedLabelAnno.draw()
  }

  onResizeEnd() {
    this.mode = 'NONE'
  }

  // 新增标签框
  onAddLabelStart(e) {
    const point = new Point(e.global)
    const { x, y } = this.container.toLocal(point.x, point.y)
    this._tempLabelAnno = new LabelAnno(
      { xmin: x, ymin: y, xmax: x + 10, ymax: y + 10, desc: '' },
      this
    )
    this.mode = 'ADD'
  }

  onAddLabelMove(e) {
    const point = new Point(e.global)
    const { x, y } = this.container.toLocal(point.x, point.y)
    this._tempLabelAnno.width = x - this._tempLabelAnno.xmin
    this._tempLabelAnno.height = y - this._tempLabelAnno.ymin
    this._tempLabelAnno.draw()
  }
  // 新增标签框
  onAddLabelEnd() {
    this.labelAnnoList.push(this._tempLabelAnno)
    this._tempLabelAnno = null
    this.mode = 'NONE'
  }

  triggerMouseUp() {
    if (this.mode === 'DRAG') {
      this.onMoveStageEnd()
    } else if (this.mode === 'ADD') {
      this.onAddLabelEnd()
    } else if (this.mode === 'SELECT') {
      this.onMoveLabelAnnoEnd()
    } else if (this.mode === 'RESIZE') {
      this.onResizeEnd()
    }
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
    this.mode = 'NONE'
  }

  onSelectLabel(pos) {
    const { x, y } = this.container.toLocal(pos)
    const point = new Point(x, y)
    var flag = false
    for (var labelAnno of this.labelAnnoList) {
      if (!flag && labelAnno.rect.containsPoint(point)) {
        labelAnno.selected = true
        flag = true
        this.mode = 'SELECT'
      } else {
        labelAnno.selected = false
      }
    }
  }

  onMoveLabelAnno(e) {
    this._temp.end = { x: e.global.x, y: e.global.y }
    const { xmin, ymin } = this.selectedLabelAnno
    this.selectedLabelAnno.xmin = xmin + (this._temp.end.x - this._temp.start.x) / this.scale
    this.selectedLabelAnno.ymin = ymin + (this._temp.end.y - this._temp.start.y) / this.scale
    this._temp.start = { x: e.global.x, y: e.global.y }
    this.selectedLabelAnno.draw()
  }

  onMoveLabelAnnoEnd() {
    this.mode = 'NONE'
  }

  setCursorStyle(event) {
    const threshold = 20
    if (!this.selectedLabelAnno) {
      this.app.canvas.style.cursor = 'default'
      return
    }
    // 判断当前光标是否为附近区域
    const xmax = this.selectedLabelAnno.xmin + this.selectedLabelAnno.width
    const ymax = this.selectedLabelAnno.ymin + this.selectedLabelAnno.height
    const { x, y } = this.container.toLocal(event.global)
    if (Math.abs(xmax - x) > threshold || Math.abs(ymax - y) > threshold) {
      this.app.canvas.style.cursor = 'default'
      this.selectedLabelAnno.showResize = false
      return
    }
    this.app.canvas.style.cursor = 'se-resize'
    this.selectedLabelAnno.showResize = true
  }
}

export default new Anno()
