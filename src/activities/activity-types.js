/**
 * @typedef {'teacher' | 'student'} ActivityMode
 */

/**
 * @typedef {Object} ActivityContext
 * @property {ActivityMode} mode
 * @property {(key: string) => string} t
 */

/**
 * @typedef {Object} ActivityModule
 * @property {string} type
 * @property {(mode: ActivityMode) => boolean} supportsMode
 * @property {(container: HTMLElement, exercise: object, context: ActivityContext, store: object) => object} mount
 */

export {};
