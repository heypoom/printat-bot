import {Bot} from '../src/bot'

describe('Bot Engine', () => {
  it('should be able to handle messages', () => {
    const bot = new Bot()
    bot.command('print', () => 'Printing...')

    expect(bot.exec('/print')).toBe('Printing...')
    expect(bot.exec('print')).toBe('Printing...')

    expect(bot.exec('$print')).toBeFalsy()
    expect(bot.exec('Hello /print')).toBeFalsy()
    expect(bot.exec('Hello /print')).toBeFalsy()
  })
})
