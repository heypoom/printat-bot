import {lineClient} from 'line'

import {Bot} from './bot'

export function setupBot() {
  const bot = new Bot({lineClient})

  bot.command('print', () => 'Printing...')

  bot.command('time', () => {
    const date = new Date()

    return `The current time is ${date.getHours()}:${date.getMinutes()}`
  })

  bot.onText(text => `You said: ${text}`)

  return bot
}
