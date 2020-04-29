/* eslint-disable no-param-reassign */
import createNewElement from './createNewElement.js';
import createWorklogEntry from './createWorklogEntry.js';

export default function createServerCard(id, state, worklog, eventSource, url) {
  const newServerCard = createNewElement('div', 'server-container');
  const serverHeader = createNewElement('div', 'server-header', `${id}`);

  const serverStatus = createNewElement('div', 'server-status-container', '<div>Status:</div>');
  const serverRunning = createNewElement('div', 'server-running', '<span>&#11044;</span> Running');
  const serverStopped = createNewElement('div', 'server-stopped', '<span>&#11044;</span> Stopped');

  const serverActions = createNewElement('div', 'server-actions-container', '<div>Actions:</div>');
  const serverStart = createNewElement('div', 'server-action server-start', '<div>&#9654;</div>');
  const serverStop = createNewElement('div', 'server-action server-stop', '<div>&#8214;</div>');
  const serverDelete = createNewElement('div', 'server-action server-delete', '<div>&#10006;</div>');

  if (state === 'running') {
    serverStopped.classList.add('disabled');
    serverStart.classList.add('disabled');
  }
  if (state === 'stopped') {
    serverRunning.classList.add('disabled');
    serverStop.classList.add('disabled');
  }
  serverStatus.appendChild(serverRunning);
  serverStatus.appendChild(serverStopped);

  serverActions.appendChild(serverStart);
  serverActions.appendChild(serverStop);
  serverActions.appendChild(serverDelete);

  newServerCard.appendChild(serverHeader);
  newServerCard.appendChild(serverStatus);
  newServerCard.appendChild(serverActions);

  function receivedStarted(event) {
    const server = JSON.parse(event.data);
    const receivedCommandStartEntry = createWorklogEntry(server.id, +new Date(), 'Received "Start command"');
    worklog.appendChild(receivedCommandStartEntry);
    worklog.scrollTop = worklog.scrollHeight;
    eventSource.removeEventListener('received', receivedStarted);
  }
  function started(event) {
    const server = JSON.parse(event.data);
    const startedEntry = createWorklogEntry(server.id, +new Date(), 'Started');
    worklog.appendChild(startedEntry);
    worklog.scrollTop = worklog.scrollHeight;
    serverStart.classList.add('disabled');
    serverStop.classList.remove('disabled');
    serverStopped.classList.add('disabled');
    serverRunning.classList.remove('disabled');
    eventSource.removeEventListener('started', started);
  }

  serverStart.addEventListener('click', () => {
    async function startServer() {
      await fetch(`${url}/instances`, {
        method: 'PUT',
        body: JSON.stringify({ id, state: 'running', action: 'started' }),
      });
    }
    startServer();
    eventSource.addEventListener('received', receivedStarted);
    eventSource.addEventListener('started', started);
  });

  function receivedStopped(event) {
    const server = JSON.parse(event.data);
    const receivedCommandStopEntry = createWorklogEntry(server.id, +new Date(), 'Received "Stop command"');
    worklog.appendChild(receivedCommandStopEntry);
    worklog.scrollTop = worklog.scrollHeight;
    eventSource.removeEventListener('received', receivedStopped);
  }
  function stopped(event) {
    const server = JSON.parse(event.data);
    const stoppedEntry = createWorklogEntry(server.id, +new Date(), 'Stopped');
    worklog.appendChild(stoppedEntry);
    worklog.scrollTop = worklog.scrollHeight;
    serverStop.classList.add('disabled');
    serverStart.classList.remove('disabled');
    serverRunning.classList.add('disabled');
    serverStopped.classList.remove('disabled');
    eventSource.removeEventListener('stopped', stopped);
  }
  serverStop.addEventListener('click', () => {
    async function stopServer() {
      await fetch(`${url}/instances`, {
        method: 'PUT',
        body: JSON.stringify({ id, state: 'stopped', action: 'stopped' }),
      });
    }
    stopServer();
    eventSource.addEventListener('received', receivedStopped);
    eventSource.addEventListener('stopped', stopped);
  });

  function receivedDeleted(event) {
    const serverId = JSON.parse(event.data);
    const receivedCommandStopEntry = createWorklogEntry(serverId, +new Date(), 'Received "Delete command"');
    worklog.appendChild(receivedCommandStopEntry);
    worklog.scrollTop = worklog.scrollHeight;
    eventSource.removeEventListener('received', receivedDeleted);
  }
  function deleted(event) {
    const serverId = JSON.parse(event.data);
    const deletedEntry = createWorklogEntry(serverId, +new Date(), 'Deleted');
    worklog.appendChild(deletedEntry);
    newServerCard.remove();
    eventSource.removeEventListener('stopped', deleted);
  }

  serverDelete.addEventListener('click', () => {
    async function deleteServer() {
      await fetch(`${url}/instances/${id}`, {
        method: 'DELETE',
      });
    }
    deleteServer();
    eventSource.addEventListener('received', receivedDeleted);
    eventSource.addEventListener('deleted', deleted);
  });

  return newServerCard;
}
