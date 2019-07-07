import errors from '@feathersjs/errors'
import {validateSignature} from '@line/bot-sdk'

const {CHANNEL_SECRET = ''} = process.env

export function validateWebhookSignature(ctx) {
  const {headers} = ctx.params

  const signature = headers['x-line-signature'] as string

  if (!signature) {
    throw new errors.BadRequest('missing LINE webhook signature!')
  }

  const body = JSON.stringify(ctx.data)
  const isValidated = validateSignature(body, CHANNEL_SECRET, signature)

  if (!isValidated) {
    throw new errors.BadRequest('invalid LINE webhook signature!')
  }
}
