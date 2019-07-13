import {createReply} from 'line/createReply'
import {lineClient} from 'line'
import {Message, Client, EventSource} from '@line/bot-sdk'

interface CreateContextOptions {
  replyToken?: string
  userId?: string
  timestamp?: number
  source?: EventSource['type']
}

export type BotContext = {
  send?: (data: string | Message) => void
  reply?: (data: string | Message) => void
} & CreateContextOptions

interface IO {
  push: Client['pushMessage']
  reply: Client['replyMessage']
}

const defaultIO: IO = {
  push: lineClient.pushMessage,
  reply: lineClient.replyMessage,
}

export function createContext(
  options: CreateContextOptions,
  io: IO = defaultIO,
): BotContext {
  const {replyToken = '', userId} = options

  const reply = createReply(replyToken, io.reply)

  return {reply, userId}
}
