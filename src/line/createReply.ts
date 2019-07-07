import chalk from 'chalk'

import {debug} from '../utils/logs'

export function createReply(replyToken: string, replyFn: Function) {
  if (!replyToken) throw new Error('missing reply token.')

  return function(data: any) {
    debug(`Reply: ${chalk.bold(data)}\n`)

    if (typeof data === 'string') {
      return replyFn(replyToken, {type: 'text', text: data})
    }

    if (typeof data === 'object') {
      return replyFn(replyToken, data)
    }

    throw new Error('unimplemented.')
  }
}
