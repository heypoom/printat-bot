import {
  WebhookRequestBody,
  MessageEvent,
  Client,
  TextEventMessage,
  EventMessage,
} from '@line/bot-sdk'

import chalk from 'chalk'

import {debug, wtf} from '../utils/logs'

type EventType = 'text'

export type TextHandler = (text: string) => any

interface LineProcessorOptions {
  client?: Client
}

interface HandlersMap {
  text: TextHandler[]
}

interface ProcessorContext {
  reply: Function
}

function createReply(replyToken: string, replyFn: Function) {
  if (!replyToken) throw new Error('missing reply token.')

  return function(data: any) {
    debug(`Reply: ${chalk.bold(data)}\n`)

    if (typeof data === 'string') {
      return replyFn(replyToken, {type: 'text', text: data})
    }

    if (typeof data === 'object') {
      return replyFn(replyToken, data)
    }

    throw new Error('unimplemented.')
  }
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

  async processEvent(event: any) {
    const {type, message} = event

    if (type === 'message') {
      const result = await this.processMessage(message)

      return this.reply(result, event.replyToken)
    }

    debug('Unhandled Event >>', event)

    return null
  }

  async processMessage(message: EventMessage) {
    const {type} = message

    switch (type) {
      case 'text':
        return this.processTextEvent(message as TextEventMessage)

      case 'sticker':
        return 'Cool Stickers!'

      case 'image':
        return 'Cool Image!'

      default:
        debug('Unhandled Message >>', type, message)

        return `I don't understand ${type} yet. Sorry...`
    }
  }

  reply(data: any, replyToken: string) {
    const reply = createReply(replyToken, this.ctx.reply)

    reply(data)
  }

  async processTextEvent(message: TextEventMessage) {
    const {type, text} = message
    if (type !== 'text') return

    debug(`Message: ${chalk.bold(text)}`)

    for (let handler of this.handlers.text) {
      const data = handler(text)

      if (data) return data
    }
  }
}
