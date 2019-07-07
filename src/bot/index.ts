import {Client} from '@line/bot-sdk'

import {createMatchHandler} from './createMatchHandler'
import {TextHandler} from './types'
import {LineProcessor} from 'line/processor'

interface BotConfig {
  lineClient?: Client
}

export type Matcher = string | RegExp

export function matchFirst(regex: RegExp, text: string): string {
  const m = regex.exec(text)
  if (!m) return ''

  return m[1] || m[0]
}

export function matchAll(regex: RegExp, text: string): string[] {
  const m = regex.exec(text)
  if (!m) return []

  return m.slice(1)
}

export class Bot {
  line: LineProcessor
  handlers: TextHandler[] = []

  constructor(config: BotConfig = {}) {
    this.line = new LineProcessor({client: config.lineClient})
  }

  match(matcher: Matcher, callback: Function) {
    const handler = createMatchHandler(matcher, callback)

    this.onText(handler)
  }

  command(name: string, callback: Function) {
    const pattern = new RegExp(`^/(${name})`)

    this.match(pattern, callback)
  }

  onText(fn: TextHandler) {
    this.handlers.push(fn)
    this.line.onText(fn)
  }

  exec(text: string) {
    for (let handler of this.handlers) {
      const r = handler(text, {})
      if (r) return r
    }

    return
  }
}
