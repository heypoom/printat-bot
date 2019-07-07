import {Machine} from 'xstate'

export const BotMachine = Machine({
  id: 'chatbot',
  initial: 'idle',
  states: {
    idle: {
      on: {
        ASK: 'asking',
      },
    },
    asking: {
      on: {
        GOT_ANSWER: 'idle',
      },
    },
  },
})
