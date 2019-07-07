import {
  WebhookRequestBody,
  MessageEvent,
  Client,
  TextEventMessage,
} from '@line/bot-sdk'

import chalk from 'chalk'

import {debug, wtf} from '../utils/logs'

type EventType = 'text'

export type TextHandler = (text: string, ev: MessageEvent) => any

interface LineProcessorOptions {
  client?: Client
}

interface HandlersMap {
  text: TextHandler[]
}

interface ProcessorContext {
  reply: Function
}

export class LineProcessor {
  client?: Client

  ctx: ProcessorContext

  handlers: HandlersMap = {
    text: [],
  }

  constructor(options: LineProcessorOptions = {}) {
    const {client} = options
    this.client = client

    if (!client) wtf('A LINE client instance is required!')

    this.ctx = {
      reply: (...args) => client && client.replyMessage(...args),
    }
  }

  async process(payload: WebhookRequestBody) {
    const {events} = payload

    if (!events) return []

    const tasks = events.map(e => this.processEvent(e))

    return Promise.all(tasks)
  }

  on(type: EventType, handler: Function) {
    const maps = {text: this.onText}
    const fn = maps[type]

    if (fn) fn(handler)
  }

  onText(handler: TextHandler) {
    this.handlers.text.push(handler)
  }

  processEvent(event: any) {
    const {type, message} = event

    if (type === 'message' && message.type === 'text') {
      return this.processTextEvent(event)
    }

    if (type === 'message') {
      debug('Unhandled Message >>', message)

      return '...?'
    }

    debug('Unhandled Event >>', event)

    return null
  }

  reply(data: any, replyToken: string) {
    const {reply} = this.ctx

    if (!replyToken) throw new Error('missing reply token.')

    debug(`Reply: ${chalk.bold(data)}\n`)

    if (typeof data === 'string') {
      return reply(replyToken, {type: 'text', text: data})
    }

    if (typeof data === 'object') {
      return reply(replyToken, data)
    }

    throw new Error('unimplemented.')
  }

  async processTextEvent(e: MessageEvent) {
    const {message} = e
    const {text} = message as TextEventMessage

    if (message.type !== 'text') return

    debug(`Message: ${chalk.bold(text)}`)

    for (let handler of this.handlers.text) {
      const data = handler(text, e)

      if (data) return this.reply(data, e.replyToken)
    }
  }
}
