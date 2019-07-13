import 'dotenv/config'

import {Request, Response} from 'express'
import feathers from '@feathersjs/feathers'
import express from '@feathersjs/express'
import {FeathersError} from '@feathersjs/errors'

import {info, wtf} from 'utils/logs'
import {LineWebhook} from 'services/LineWebhook'
import {hooksProvider} from 'middleware/hooks-provider'

const {PORT} = process.env

export const app = express(feathers())

// Turn on JSON body parsing for REST services
app.use(express.json())

// Turn on URL-encoded body parsing for REST services
app.use(express.urlencoded({extended: true}))

// Set up REST transport using Express
app.configure(express.rest())

app.use(hooksProvider)

const IndexRoute = async (_req: Request, res: Response) =>
  res.send({status: 'OK!'})

const LIFFApp = async (req: Request, res: Response) => {
  return res.send('<h1>Hello!</h1>')
}

app.get('/', IndexRoute)
app.get('/app', LIFFApp)
app.configure(LineWebhook)

// Set up an error handler that gives us nicer errors
const errorHandler = express.errorHandler({
  json(error: FeathersError, _req: Request, res: Response, next: Function) {
    wtf(`HTTP Error ${error.code} (${error.name}):`, error.message)

    res.sendStatus(error.code)
    next()
  },
})

app.use(errorHandler)

app.listen(PORT, () => {
  info(`Starting server at port ${PORT}.`)
})
