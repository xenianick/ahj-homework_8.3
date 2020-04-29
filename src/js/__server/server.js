const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const Router = require('koa-router');
const uuid = require('uuid');
const { streamEvents } = require('http-event-stream');

const app = new Koa();
const router = new Router();

app.use(koaBody({
  urlencoded: true,
  multipart: true,
  json: true,
}));

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());

const servers = [];

router.get('/', async (ctx) => {
  const serversJson = JSON.stringify(servers);
  ctx.response.body = serversJson;
});

app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    await next();
    return;
  }
  const headers = { 'Access-Control-Allow-Origin': '*' };
  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({ ...headers });
    try {
      await next();
      return;
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }
  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });
    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Allow-Request-Headers'));
    }
    ctx.response.status = 204;
  }
});
let sendEvent;

router.get('/sse', async (ctx) => {
  streamEvents(ctx.req, ctx.res, {
    stream(sse) {
      sendEvent = (result, evt) => {
        const serverJson = JSON.stringify(result);
        sse.sendEvent({
          data: serverJson,
          event: evt,
        });
      };
      return () => {};
    },
  });
  ctx.respond = false;
});

router.post('/instances', async (ctx) => {
  const id = uuid.v4();
  const newServer = { id, state: 'stopped' };
  sendEvent(newServer, 'received');
  setTimeout(() => {
    sendEvent(newServer, 'created');
    servers.push(newServer);
  }, 5000);
  ctx.response.body = { status: 'ok' };
});

router.put('/instances', async (ctx) => {
  const data = JSON.parse(ctx.request.body);
  const newState = data.state;
  const { action } = data;
  const serverToChangeState = servers.find((item) => item.id === data.id);
  serverToChangeState.state = newState;
  sendEvent(data, 'received');
  setTimeout(() => {
    sendEvent(serverToChangeState, action);
  }, 5000);
  ctx.response.status = 204;
});

router.delete('/instances/:id', async (ctx) => {
  const idToDel = ctx.params.id;
  const indexToDel = servers.findIndex((item) => item.id === idToDel);
  servers.splice(indexToDel, 1);
  sendEvent(idToDel, 'received');
  setTimeout(() => {
    sendEvent(idToDel, 'deleted');
  }, 5000);
  ctx.response.status = 204;
});

app.use(router.routes());
app.use(router.allowedMethods());

server.listen(port);
