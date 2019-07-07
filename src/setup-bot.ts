import {interpret} from 'xstate'

import {lineClient} from 'line'
import {debug} from 'utils/logs'

import {Bot} from './bot'
import {BotMachine} from './bot/machine'

function setupState(bot: Bot) {
  const onTransition = (state: any) => debug(`State = ${state.value}`)

  const service = interpret(BotMachine).onTransition(onTransition)
  service.start()

  bot.command('ask', () => {
    service.send('ASK')

    return 'Please Answer.'
  })

  bot.command('answer', () => {
    service.send('GOT_ANSWER')

    return 'Good.'
  })

  // Declare the state override here.
  bot.onText(() => {
    const {value} = service.state

    if (value === 'asking') {
      return 'You are being asked a question.'
    }
  })

  return service
}

export function setupBot() {
  const bot = new Bot({lineClient})

  setupState(bot)

  bot.command('print', () => 'Printing...')

  bot.command('time', () => {
    const date = new Date()

    return `The current time is ${date.getHours()}:${date.getMinutes()}`
  })

  bot.match(/\pay (\d+)/, (amount: string) => `Pay me ${amount} by today.`)

  bot.onText(text => `You said: ${text}`)

  return bot
}
