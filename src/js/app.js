import createNewElement from './createNewElement.js';
import createServerCard from './createServerCard.js';
import createWorklogEntry from './createWorklogEntry.js';

const bodyEl = document.querySelector('body');

const mainContainer = createNewElement('div', 'main-container');

const serversContainer = createNewElement('div', 'servers data-container');
const serversContainerHeader = createNewElement('div', 'container-header', '<p>Your micro instances:</p>');
const serversWrapper = createNewElement('div', 'servers-wrapper');
const addServerBtn = createNewElement('button', 'add-server-btn', '<p>Create new instance</p>');
addServerBtn.type = 'button';
serversContainer.appendChild(serversContainerHeader);
serversContainer.appendChild(serversWrapper);
serversContainer.appendChild(addServerBtn);

const worklogContainer = createNewElement('div', 'worklog data-container');
const worklogContainerHeader = createNewElement('div', 'container-header', '<p>Worklog:</p>');
const worklogWrapper = createNewElement('div', 'worklog-wrapper');
worklogContainer.appendChild(worklogContainerHeader);
worklogContainer.appendChild(worklogWrapper);

mainContainer.appendChild(serversContainer);
mainContainer.appendChild(worklogContainer);
bodyEl.insertBefore(mainContainer, bodyEl.firstChild);

const url = 'https://ahj-homework-8-3.herokuapp.com';

const eventSource = new EventSource(`${url}/sse`);

async function getServers() {
  const response = await fetch(`${url}`);
  if (response.ok) {
    const serversArchive = await response.json();
    serversArchive.forEach((item) => {
      const serverCard = createServerCard(item.id, item.state, worklogWrapper, eventSource, url);
      serversWrapper.appendChild(serverCard);
      serversWrapper.scrollTop = serversWrapper.scrollHeight;
    });
  }
}
getServers();

function receivedCreate(event) {
  const server = JSON.parse(event.data);
  const receivedCommandCreateEntry = createWorklogEntry(server.id, +new Date(), 'Received "Create command"');
  worklogWrapper.appendChild(receivedCommandCreateEntry);
  worklogWrapper.scrollTop = worklogWrapper.scrollHeight;
  eventSource.removeEventListener('received', receivedCreate);
}
function created(event) {
  const server = JSON.parse(event.data);
  const serverCard = createServerCard(server.id, server.state, worklogWrapper, eventSource, url);
  serversWrapper.appendChild(serverCard);
  serversWrapper.scrollTop = serversWrapper.scrollHeight;
  const createdEntry = createWorklogEntry(server.id, +new Date(), 'Created');
  worklogWrapper.appendChild(createdEntry);
  worklogWrapper.scrollTop = worklogWrapper.scrollHeight;
  eventSource.removeEventListener('created', created);
}

addServerBtn.addEventListener('click', () => {
  async function createServer() {
    await fetch(`${url}/instances`, {
      method: 'POST',
    });
  }
  createServer();
  eventSource.addEventListener('received', receivedCreate);
  eventSource.addEventListener('created', created);
});
