import { toObjectTypeString, stateDecoRegExp } from './lang';

export function quacksLikeADecorator(args: any[]): boolean {
  return (args.length === 2 || args.length === 3) && typeof args[1] === 'string'
}

// prop can be decorated by @state
export const canObserve = (value: any): boolean => {
  return stateDecoRegExp.test(toObjectTypeString(value));
}
