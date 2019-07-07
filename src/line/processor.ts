import {
  WebhookRequestBody,
  MessageEvent,
  Client,
  TextEventMessage,
  EventMessage,
  ReplyableEvent,
  WebhookEvent,
} from '@line/bot-sdk'

import chalk from 'chalk'

import {debug, wtf} from '../utils/logs'

type EventType = EventMessage['type']

type BaseEvent = ReplyableEvent & {type: string} & WebhookEvent
export type TextHandler = (text: string) => any

interface LineProcessorOptions {
  client?: Client
}

type HandlersMap = Record<EventType, Function[]>

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

const defaultHandlers: HandlersMap = {
  text: [],
  image: [],
  video: [],
  audio: [],
  location: [],
  file: [],
  sticker: [],
}

export class LineProcessor {
  client?: Client
  ctx: ProcessorContext
  handlers: HandlersMap = defaultHandlers

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
    if (!this.handlers[type]) this.handlers[type] = []

    this.handlers[type].push(handler)
  }

  onText(handler: TextHandler) {
    this.on('text', handler)
  }

  async processEvent(event: BaseEvent) {
    const {type, replyToken} = event

    if (type === 'message') {
      const result = await this.processMessage(event.message)

      return this.reply(result, replyToken)
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
