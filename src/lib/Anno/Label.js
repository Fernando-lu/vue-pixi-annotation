import { Graphics, Text } from 'pixi.js'

const colors = {
  DEFAULT: 0xfeeb77,
  SELECTED: 0xff0000
}
export default class LabelAnno {
  static STROKE_WIDTH = 2
  static FONT_SIZE = 12
  static MIN_WIDTH = 50
  static MIN_HEIGHT = 50

  constructor(anno, Anno) {
    this._width = 0
    this._height = 0
    this._selected = false

    this.rect = undefined
    this.text = undefined
    this.anno = anno

    const { xmin, ymin, xmax, ymax, desc } = anno
    this.id = this.generateUUID()
    this.xmin = xmin
    this.ymin = ymin
    this.desc = desc
    this.width = Math.abs(xmin - xmax)
    this.height = Math.abs(ymax - ymin)

    this.container = Anno.container
    this.Anno = Anno

    this.draw()
    this.mode = 'NONE'

    // 考虑把这个属性挪到container处
    this.showResize = false

    this._temp = {
      xmin: 0,
      ymin: 0,
      width: 0,
      height: 0
    }
  }

  get selected() {
    return this._selected
  }
  set selected(value) {
    if (value === this._selected) return
    this._selected = value
    this.draw()
  }

  get width() {
    return this._width
  }
  set width(val) {
    this._width = Math.max(LabelAnno.MIN_WIDTH, val)
  }

  get height() {
    return this._height
  }
  set height(val) {
    this._height = Math.max(LabelAnno.MIN_HEIGHT, val)
  }

  generateUUID() {
    return crypto.randomUUID() // 生成一个随机 UUID
  }

  // 根据anno信息绘制
  draw() {
    this.rect?.destroy()
    this.text?.destroy()
    this.textBackground?.destroy

    const color = this.selected ? colors.SELECTED : colors.DEFAULT
    const graphics = new Graphics()
    this.rect = graphics.rect(this.xmin, this.ymin, this.width, this.height)
    this.rect.stroke({ width: LabelAnno.STROKE_WIDTH / this.Anno.scale, color })
    this.rect.fill({ color: 0x000000, alpha: 0 })
    this.rect.interactive = true
    this.initEvents()
    this.container.addChild(graphics)

    // 添加描述文字
    this.text = new Text({
      text: this.desc,
      style: {
        fontSize: LabelAnno.FONT_SIZE / this.Anno.scale
      }
    })
    this.text.x = this.xmin
    this.text.y = this.ymin
    // 给字体加背景颜色
    this.textBackground = graphics.rect(this.xmin, this.ymin, this.text.width, this.text.height)
    this.textBackground.fill({ color: 0xffffff })

    this.container.addChild(this.text)
  }

  destroy() {
    // remove by id
    const index = this.Anno.labelAnnoList.findIndex((i) => this.id === i.id)
    if (index !== -1) {
      this.Anno.labelAnnoList.splice(index, 1)
    }
    this.rect?.destroy()
    this.text?.destroy()
    this.textBackground?.destroy
  }

  getAnnoInfo() {
    const { xmin, ymin, width, height, desc } = this
    const xmax = xmin + width
    const ymax = ymin + height
    return {
      xmax,
      ymax,
      xmin,
      ymin,
      desc
    }
  }

  initEvents() {
    this.rect.on('rightclick', () => {
      this.destroy()
    })
  }
}
