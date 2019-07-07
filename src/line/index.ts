import {Client} from '@line/bot-sdk'

const {CHANNEL_ACCESS_TOKEN = '', CHANNEL_SECRET = ''} = process.env

export const lineConfig = {
  channelAccessToken: CHANNEL_ACCESS_TOKEN,
  channelSecret: CHANNEL_SECRET,
}

export const lineClient = new Client(lineConfig)
