import { deepMerge } from '../utils/common'
import { ConfigCtx } from '../interfaces';

export let ctx: ConfigCtx = {
  middleware: {
    logger: process.env.NODE_ENV !== 'production',
    effect: true
  },
  timeTravel: {
    isActive: false,
    maxStepNumber: 5,
    keepInitialSnapshot: false,
  },
  devTool: false,
};

/**
 * framework global config method.
 */
export function config(conf: ConfigCtx) {
  ctx = deepMerge(ctx, conf);
}
