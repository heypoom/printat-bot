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
import {createReply} from './createReply'
import {TextHandler} from 'bot/types'
import {BotContext, createContext} from 'bot/context'

type EventType = EventMessage['type']
type BaseEvent = ReplyableEvent & {type: string} & WebhookEvent

interface LineProcessorOptions {
  client?: Client
}

type HandlerFunc = (item: any, context: BotContext) => any
type HandlersMap = Record<EventType, HandlerFunc[]>

interface ProcessorContext {
  reply: Function
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

  on(type: EventType, handler: HandlerFunc) {
    if (!this.handlers[type]) this.handlers[type] = []

    this.handlers[type].push(handler)
  }

  onText(handler: TextHandler) {
    this.on('text', handler)
  }

  async processEvent(event: BaseEvent) {
    const {type, replyToken, source, timestamp} = event
    const {userId} = source

    const context = createContext({
      replyToken,
      userId,
      timestamp,
      source: source.type,
    })

    if (type === 'message') {
      const {message} = event as MessageEvent
      const result = await this.processMessage(message, context)

      return this.reply(result, replyToken)
    }

    debug('Unhandled Event >>', event)

    return null
  }

  async processMessage(message: EventMessage, context: BotContext) {
    const {type} = message

    switch (type) {
      case 'text':
        return this.processTextEvent(message as TextEventMessage, context)

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

  async processTextEvent(message: TextEventMessage, context: BotContext) {
    const {type, text} = message
    if (type !== 'text') return

    debug(`Message: ${chalk.bold(text)}`)

    for (let handler of this.handlers.text) {
      const data = handler(text, context)

      if (data) return data
    }
  }
}
