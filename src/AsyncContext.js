const async_hooks = require('async_hooks');

const hooks = async_hooks.createHook({ init, before, after, destroy });
hooks.enable();

const context = {};
const idStack = [];
let currentId = 0;

function init(asyncId, type, triggerAsyncId, resource) {
  context[asyncId] = context[triggerAsyncId];
}

function before(asyncId) {
  idStack.push(currentId);
  currentId = asyncId;
}

function after(asyncId) {
  if (currentId != asyncId) {
    throw "bad async id";
  }
  currentId = idStack.pop();
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
