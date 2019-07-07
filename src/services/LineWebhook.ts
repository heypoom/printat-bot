import {Application} from '@feathersjs/feathers'
import {WebhookRequestBody} from '@line/bot-sdk'

import {getProcessor} from 'line'
import {validateWebhookSignature} from 'line/validate-signature'

class WebhookService {
  processor = getProcessor()

  async find() {
    return {}
  }

  async create(payload: WebhookRequestBody, k) {
    return this.processor.processAll(payload)
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
