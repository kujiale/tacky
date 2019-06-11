export function quacksLikeADecorator(args: any[]): boolean {
  return (args.length === 2 || args.length === 3) && typeof args[1] === 'string'
}

