import {Client} from '@line/bot-sdk'

import {LineProcessor, TextHandler} from 'line/processor'
import {exec} from 'child_process'
import {lineClient} from 'line'

interface BotConfig {
  lineClient?: Client
}

type Matcher = string | RegExp

export function matchFirst(regex: RegExp, text: string): string {
  const m = regex.exec(text)
  if (!m) return ''

  return m[1]
}

export function matchAll(regex: RegExp, text: string): string[] {
  const m = regex.exec(text)
  if (!m) return []

  return m.slice(1)
}

export const createMatchHandler = (matcher: Matcher, callback: Function) => (
  text: string,
  ...args: any[]
) => {
  const reply = () => callback(text, ...args)

  if (typeof matcher === 'string' && text.startsWith(matcher)) {
    return reply()
  }

  if (matcher instanceof RegExp) {
    const m = matchFirst(matcher, text)
    if (m) return reply()
  }
}

export class Bot {
  line: LineProcessor

  constructor(config: BotConfig) {
    this.line = new LineProcessor({client: config.lineClient})
  }

  match(matcher: Matcher, callback: Function) {
    const handler = createMatchHandler(matcher, callback)

    this.line.onText(handler)
  }

  onText(fn: TextHandler) {
    this.line.onText(fn)
  }
}
