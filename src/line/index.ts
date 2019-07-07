import {Client} from '@line/bot-sdk'

import {LineProcessor} from './processor'

const {CHANNEL_ACCESS_TOKEN = '', CHANNEL_SECRET = ''} = process.env

export const lineConfig = {
  channelAccessToken: CHANNEL_ACCESS_TOKEN,
  channelSecret: CHANNEL_SECRET,
}

export const client = new Client(lineConfig)

export function getProcessor() {
  const processor = new LineProcessor({client})

  processor.addMessageHandler(e => {
    if (e.message.type !== 'text') return

    return `You said: ${e.message.text}`
  })

  return processor
}
