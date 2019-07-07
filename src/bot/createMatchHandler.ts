import {Matcher, matchFirst} from '.'

export const createMatchHandler = (matcher: Matcher, callback: Function) => (
  text: string,
  ...args: any[]
) => {
  const reply = (res = text) => callback(res, ...args)

  if (typeof matcher === 'string' && text.includes(matcher)) {
    return reply()
  }

  if (matcher instanceof RegExp) {
    const m = matchFirst(matcher, text)

    if (m) return reply(m)
  }
}
