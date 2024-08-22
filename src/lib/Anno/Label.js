import { Graphics } from 'pixi.js'
export default class LabelAnno {
  constructor(anno, container) {
    this.anno = anno
    const { xmin, ymin, xmax, ymax, desc } = anno
    this.xmin = xmin
    this.xmax = xmax
    this.ymax = ymax
    this.ymin = ymin
    this.desc = desc
    this.width = Math.abs(xmin - xmax)
    this.height = Math.abs(ymax - ymin)
    this.isSelected = false
    this.rect = undefined
    this.container = container

    this.STROKE_WIDTH = 2

    this.init()
  }

  init() {
    const graphics = new Graphics()
    const rect = graphics.rect(this.xmin, this.ymin, this.width, this.height)
    rect.stroke({ width: this.STROKE_WIDTH, color: 0xfeeb77 })
    this.rect = rect
    this.container.addChild(this.rect)
  }

  // 根据anno信息绘制
  draw(scale) {
    this.rect.destroy()

    const graphics = new Graphics()
    const rect = graphics.rect(this.xmin, this.ymin, this.width, this.height)
    this.rect = rect
    this.rect.stroke({ width: this.STROKE_WIDTH / scale, color: 0xfeeb77 })

    this.container.addChild(this.rect)
  }
}
