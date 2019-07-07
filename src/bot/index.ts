import {Client} from '@line/bot-sdk'

import {LineProcessor} from '../line/processor'
import {interpret, Interpreter, DefaultContext, EventObject} from 'xstate'
import {BotMachine} from './machine'
import {debug} from '../utils/logs'
import chalk from 'chalk'

interface BotConfig {
  lineClient?: Client
}

type Matcher = string | RegExp

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

export const createMatchHandler = (matcher: Matcher, callback: Function) => (
  text: string,
  ...args: any[]
) => {
  const reply = (res = text) => callback(res, ...args)

  if (typeof matcher === 'string' && text.includes(matcher)) {
    return reply()
  }

  if (matcher instanceof RegExp) {
    const m = matchFirst(matcher, text)
    if (m) return reply(m)
  }
}

type TextHandler = (text: string, ...args: any[]) => string | undefined

export class Bot {
  line: LineProcessor
  handlers: TextHandler[] = []

  service: Interpreter<DefaultContext, any, EventObject>

  constructor(config: BotConfig = {}) {
    this.line = new LineProcessor({client: config.lineClient})

    this.service = interpret(BotMachine).onTransition(this.onTransition)
    this.service.start()

    this.command('ask', () => {
      this.service.send('ASK')

      return 'Please Answer.'
    })

    this.command('answer', () => {
      this.service.send('GOT_ANSWER')

      return 'Good.'
    })

    // Declare the state override here.
    this.onText(() => {
      const {value} = this.service.state

      if (value === 'asking') {
        return 'You are being asked a question.'
      }
    })
  }

  private onTransition(state: any) {
    debug(`>> State = ${chalk.bold(state.value)}`)
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
