import {validateSignature} from '@line/bot-sdk'

const {CHANNEL_SECRET = ''} = process.env

export function validateWebhookSignature(ctx) {
  const {headers} = ctx.params

  const signature = headers['x-line-signature'] as string

  if (!signature) {
    ctx.result = 'missing LINE webhook signature!'
    ctx.statusCode = 200
  }

  const body = JSON.stringify(ctx.data)
  const isValidated = validateSignature(body, CHANNEL_SECRET, signature)

  if (!isValidated) {
    ctx.result = 'invalid LINE webhook signature!'
    ctx.statusCode = 200
  }
}
