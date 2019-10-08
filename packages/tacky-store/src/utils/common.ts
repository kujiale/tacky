export function isObject(value: any): boolean {
  return value !== null && typeof value === "object"
}

// {}
export function isPlainObject(value: any) {
  if (value === null || typeof value !== "object") return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

// boolean, string, number, undefined, null
export function isPrimitive(value: any) {
  return value === null || (typeof value !== 'object' && typeof value !== 'function');
}

// From: https://github.com/facebook/fbjs/blob/c69904a511b900266935168223063dd8772dfc40/packages/fbjs/src/core/shallowEqual.js
export function is(x, y) {
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y
  } else {
    return x !== x && y !== y
  }
}

export function bind(fn, ctx) {
  function boundFn(a?: any) {
    const l: number = arguments.length
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }
  return boundFn
}

// From: https://github.com/facebook/fbjs/blob/c69904a511b900266935168223063dd8772dfc40/packages/fbjs/src/core/shallowEqual.js
export function shallowEqual(objA, objB) {
  if (is(objA, objB)) return true
  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false
  }
  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)
  if (keysA.length !== keysB.length) return false
  for (let i = 0; i < keysA.length; i++) {
    if (!objB.hasOwnProperty(keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false
    }
  }
  return true
}

function isMergeableObject(val) {
  const nonNullObject = val && typeof val === 'object'

  return nonNullObject
    && Object.prototype.toString.call(val) !== '[object RegExp]'
    && Object.prototype.toString.call(val) !== '[object Date]'
}

function emptyTarget(val) {
  return Array.isArray(val) ? [] : {};
}

function cloneIfNecessary(value, optionsArgument) {
  const clone = optionsArgument && optionsArgument.clone === true
  return (clone && isMergeableObject(value)) ? deepMerge(emptyTarget(value), value, optionsArgument) : value
}

function defaultArrayMerge(target, source, optionsArgument) {
  const destination = target.slice()
  source.forEach((e, i) => {
    if (typeof destination[i] === 'undefined') {
      destination[i] = cloneIfNecessary(e, optionsArgument)
    } else if (isMergeableObject(e)) {
      destination[i] = deepMerge(target[i], e, optionsArgument)
    } else if (target.indexOf(e) === -1) {
      destination.push(cloneIfNecessary(e, optionsArgument))
    }
  })
  return destination
}

function mergeObject(target, source, optionsArgument) {
  const destination = {}
  if (isMergeableObject(target)) {
    Object.keys(target).forEach((key) => {
      destination[key] = cloneIfNecessary(target[key], optionsArgument)
    })
  }
  Object.keys(source).forEach((key) => {
    if (!isMergeableObject(source[key]) || !target[key]) {
      destination[key] = cloneIfNecessary(source[key], optionsArgument)
    } else {
      destination[key] = deepMerge(target[key], source[key], optionsArgument)
    }
  })
  return destination
}

export function deepMerge(target, source, optionsArgument?: any) {
  const array = Array.isArray(source)
  const options = optionsArgument || { arrayMerge: defaultArrayMerge }
  const arrayMerge = options.arrayMerge || defaultArrayMerge

  if (array) {
    return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument)
  } else {
    return mergeObject(target, source, optionsArgument)
  }
}
