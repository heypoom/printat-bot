import {BotContext} from './context'

export type TextHandler = (
  text: string,
  context: BotContext,
) => string | undefined
