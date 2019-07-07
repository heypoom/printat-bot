import {MessageEvent} from '@line/bot-sdk'

import {LineProcessor} from '../src/line/processor'

describe('LINE Processor', () => {
  it('should process messages from LINE.', async () => {
    const processor = new LineProcessor()

    processor.ctx.reply = jest.fn(async (tok, msg) => {
      return msg
    })

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
      replyToken: '',
    }

    processor.addMessageHandler(e => 'Hello, World!')

    const [result] = await processor.processAll({
      destination: 'faux',
      events: [msg],
    })

    expect(result.type).toBe('text')
    expect(result.text).toBe('Hello, World!')
  })
})
