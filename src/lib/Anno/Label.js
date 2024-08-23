import { Graphics, Point } from 'pixi.js'

const colors = {
  DEFAULT: 0xfeeb77,
  SELECTED: 0xff0000
}
export default class LabelAnno {
  constructor(anno, Anno) {
    this.anno = anno
    const { xmin, ymin, xmax, ymax, desc, id } = anno
    this.id = id
    this.xmin = xmin
    this.ymin = ymin
    this.desc = desc
    this.width = Math.abs(xmin - xmax)
    this.height = Math.abs(ymax - ymin)
    this._selected = false
    this.rect = undefined
    this.container = Anno.container
    this.Anno = Anno
    this.STROKE_WIDTH = 2
    this.draw()
    this.mode = 'NONE'
  }

  get selected() {
    return this._selected
  }

  set selected(value) {
    if (value === this._selected) return
    this._selected = value
    this.draw()
  }


  // 根据anno信息绘制
  draw() {
    if (this.rect) {
      this.rect.destroy()
    }
    const color = this.selected ? colors.SELECTED : colors.DEFAULT
    const graphics = new Graphics()
    this.rect = graphics.rect(this.xmin, this.ymin, this.width, this.height)
    this.rect.stroke({ width: this.STROKE_WIDTH / this.Anno.scale, color })
    this.rect.fill({ color: 0x000000, alpha: 0 })
    this.rect.interactive = true
    this.initEvents()
    this.container.addChild(this.rect)
    console.log('-1233')
  }

  destroy() {
    this.rect.destroy()
  }

  initEvents() {
  }
}
