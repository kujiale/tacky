import { Effect, EMaterialType, Middleware } from '../interfaces';

function createEffectMiddleware(): Middleware {
  return ({ dispatch }) => (next: any) => async (action) => {
    const { name, payload, type, domain, original } = action;

    if (type === EMaterialType.EFFECT) {
      const effect = original as Effect;
      await effect(...payload);
      return;
    }

    return next(action);
  }
}

export default createEffectMiddleware();
