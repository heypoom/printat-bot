import {createReply} from 'line/createReply'
import {lineClient} from 'line'
import {Message, Client} from '@line/bot-sdk'

export interface BotContext {
  send?: (data: string | Message) => void
  reply?: (data: string | Message) => void
}

interface CreateContextOptions {
  replyToken?: string
}

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
  const {replyToken = ''} = options

  const reply = createReply(replyToken, io.reply)

  return {reply}
}
