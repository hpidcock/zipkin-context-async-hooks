const async_hooks = require('async_hooks');

const hooks = async_hooks.createHook({ init, destroy });
hooks.enable();

const context = {};

function init(asyncId, type, triggerAsyncId, resource) {
  context[asyncId] = context[triggerAsyncId];
}

function destroy(asyncId) {
  delete context[asyncId];
}

class AsyncContext {
  setContext(ctx) {
    const currentId = async_hooks.executionAsyncId();
    context[currentId] = ctx;
  }

  getContext() {
    const currentId = async_hooks.executionAsyncId();
    return context[currentId];
  }

  scoped(callable) {
    const currentId = async_hooks.executionAsyncId();
    const prevContext = context[currentId];
    const res = callable();
    context[currentId] = prevContext;
    return res;
  }

  letContext(ctx, callable) {
    const currentId = async_hooks.executionAsyncId();
    const prevContext = context[currentId];
    context[currentId] = ctx;
    const res = callable();
    context[currentId] = prevContext;
    return res;
  }
}

module.exports = new AsyncContext();
