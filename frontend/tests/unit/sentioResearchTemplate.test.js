import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parse, compileTemplate } from '@vue/compiler-sfc'
import { describe, expect, it } from 'vitest'

describe('Research page production template', () => {
  it('compiles every template expression', () => {
    const filename = resolve(process.cwd(), 'src/pages/SentioResearch.vue')
    const { descriptor } = parse(readFileSync(filename, 'utf8'))
    const result = compileTemplate({
      source: descriptor.template.content,
      filename,
      id: 'sentio-research',
    })
    expect(result.errors).toEqual([])
  })
})
