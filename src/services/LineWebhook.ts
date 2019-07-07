import {Application} from '@feathersjs/feathers'
import {WebhookRequestBody} from '@line/bot-sdk'

import {setupBot} from 'bot'
import {validateWebhookSignature} from 'line/validate-signature'

const bot = setupBot()

class WebhookService {
  async find() {
    return {}
  }

  async create(payload: WebhookRequestBody) {
    return bot.line.process(payload)
  }
}

export function LineWebhook(this: Application, app: Application) {
  const webhook = new WebhookService()

  app.use('webhook', webhook)

  app.service('webhook').hooks({
    before: {
      create: [validateWebhookSignature],
    },
  })
}
