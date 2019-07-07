import {MessageEvent} from '@line/bot-sdk'

import {LineProcessor} from '../src/line/processor'

describe('LINE Processor', () => {
  it('should process messages from LINE.', async () => {
    const line = new LineProcessor()
    line.ctx.reply = (_, msg) => msg

    const msg: MessageEvent = {
      type: 'message',
      message: {
        id: '',
        type: 'text',
        text: 'Hello!',
      },
      timestamp: 0,
      source: {
        type: 'user',
        userId: '',
      },
      replyToken: 'www',
    }

    line.onText(() => 'Hello, World!')

    const [result] = await line.process({
      destination: 'faux',
      events: [msg],
    })

    expect(result.type).toBe('text')
    expect(result.text).toBe('Hello, World!')
  })
})
