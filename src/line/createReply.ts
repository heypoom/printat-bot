import chalk from 'chalk'

import {debug, wtf} from '../utils/logs'

function getHTTPError(error: any) {
  const {originalError: err} = error

  if (err.response) {
    const {response} = err
    const {data} = response

    return data
  }

  return false
}

export function createReply(replyToken: string, replyFn: Function) {
  if (!replyToken) throw new Error('missing reply token.')

  return async function(data: any) {
    try {
      debug(`Reply: ${chalk.bold(data)}\n`)
      // debug(`Reply Token: ${replyToken}`)

      if (typeof data === 'string') {
        return await replyFn(replyToken, {type: 'text', text: data})
      }

      if (typeof data === 'object') {
        return await replyFn(replyToken, data)
      }

      throw new Error('unimplemented.')
    } catch (error) {
      const {statusCode, statusMessage} = error

      if (statusCode) {
        const errorData = getHTTPError(error)
        if (!errorData) return

        const {message} = errorData

        if (message.includes('Invalid reply token')) {
          wtf(`Invalid Reply Token "${replyToken}"`)

          return true
        }

        wtf(`Cannot Reply: HTTP ${statusCode} (${statusMessage}):`, errorData)
        return false
      }

      wtf('Reply: WTF?')
    }
  }
}
