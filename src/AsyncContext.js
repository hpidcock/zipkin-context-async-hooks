const async_hooks = require('async_hooks');

const hooks = async_hooks.createHook({ init, before, after, destroy });
hooks.enable();

const context = {};
let currentId = null;

function init(asyncId, type, triggerAsyncId, resource) {
  context[asyncId] = context[triggerAsyncId];
}

function before(asyncId) {
  currentId = asyncId;
}

function after(asyncId) {
  currentId = null;
}

function destroy(asyncId) {
  delete context[asyncId];
}

class AsyncContext {
  setContext(ctx) {
    context[currentId] = ctx;
  }

  getContext() {
    return context[currentId];
  }

  scoped(callable) {
    const prevContext = context[currentId];
    const res = callable();
    context[currentId] = prevContext;
    return res;
  }

  letContext(ctx, callable) {
    const prevContext = context[currentId];
    context[currentId] = ctx;
    const res = callable();
    context[currentId] = prevContext;
    return res;
  }
}

module.exports = new AsyncContext();

