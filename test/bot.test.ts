import {Bot} from '../src/bot'

describe('Bot Engine', () => {
  it('should be able to handle commands', () => {
    const bot = new Bot()
    bot.command('print', () => 'Printing...')

    expect(bot.exec('/print')).toBe('Printing...')

    expect(bot.exec('$print')).toBeFalsy()
    expect(bot.exec('Hello /print')).toBeFalsy()
    expect(bot.exec('Hello /print')).toBeFalsy()
  })

  it('should handle regex matches', () => {
    const bot = new Bot()
    bot.match(/krub!?$/, () => 'Thank you ka!')

    expect(bot.exec('krub pai mai ka?')).toBeFalsy()
    expect(bot.exec('okay krub')).toBe('Thank you ka!')
    expect(bot.exec('OK krub!')).toBe('Thank you ka!')
  })

  it('should handle regex capture groups', () => {
    const bot = new Bot()
    bot.match(/\pay (\d+)/, (amt: string) => `Pay me ${amt} by today.`)

    expect(bot.exec('/pay 500')).toBe('Pay me 500 by today.')
  })
})
