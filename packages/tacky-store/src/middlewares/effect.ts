import { Effect, EMaterialType, Middleware } from '../interfaces';

function createEffectMiddleware(): Middleware {
  return ({ dispatch, getState }) => (next: any) => async (action) => {
    const { name, payload, type, namespace, original } = action;

    if (type === EMaterialType.EFFECT) {
      const effect = original as Effect;
      await effect(...payload);
      return;
    }

    return next(action);
  }
}

export default createEffectMiddleware();
