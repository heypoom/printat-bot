import {
  WebhookRequestBody,
  MessageEvent,
  ReplyableEvent,
  WebhookEvent,
  Client,
} from '@line/bot-sdk'

import {debug, wtf} from '../utils/logs'

type BaseEvent = ReplyableEvent & {type: string} & WebhookEvent

export type WebhookHandler<T> = (event: T, destination: string) => any
export type MessageHandler = WebhookHandler<MessageEvent>

interface LineProcessorOptions {
  client?: Client
}

export class LineProcessor {
  client?: Client
  ctx: {reply: Client['replyMessage']} = {reply: () => {}}
  messageHandlers: MessageHandler[] = []

  constructor(options: LineProcessorOptions = {}) {
    const {client} = options

    if (!client) {
      wtf('A LINE client instance is required!')
    }

    if (client) {
      this.client = client
      this.ctx = {reply: (...args) => client.replyMessage(...args)}
    }
  }

  addMessageHandler(handler: MessageHandler) {
    this.messageHandlers.push(handler)
  }

  process(event: any, uid: string) {
    const {type, message} = event

    if (type === 'message' && message.type === 'text') {
      return this.processMessageEvent(event, uid)
    }

    return null
  }

  async processMessageEvent(e: MessageEvent, uid: string) {
    const {reply} = this.ctx
    const result = this.processEvent(e, uid, this.messageHandlers)

    if (typeof result === 'string') {
      return reply(e.replyToken, {type: 'text', text: result})
    }
  }

  async processAll(payload: WebhookRequestBody) {
    const {events, destination} = payload

    debug('Events >>', payload)

    if (!events) return []

    return Promise.all(events.map(e => this.process(e, destination)))
  }

  processEvent<T extends BaseEvent>(
    event: T,
    uid: string,
    handlers: WebhookHandler<T>[],
  ) {
    for (let handler of handlers) {
      const result = handler(event, uid)

      if (result) return result
    }
  }
}
