import {lineClient} from 'line'

import {Bot} from './bot'

export function setupBot() {
  const bot = new Bot({lineClient})

  bot.match('/print', () => 'Printing...')
  bot.onText(text => `You said: ${text}`)

  return bot
}
