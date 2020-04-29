import createNewElement from './createNewElement.js';
import readDate from './readDate.js';

export default function createWorklogEntry(id, date, info) {
  const readedDate = readDate(date);
  const newWorklogEntry = createNewElement('div', 'worklog-container');
  const worklogDate = createNewElement('div', 'worklog-date', `${readedDate}`);
  const worklogId = createNewElement('div', 'worklog-id-container', `<div>Server:</div><div>${id}</div>`);
  const worklogInfo = createNewElement('div', 'worklog-info-container', `<div>INFO:</div><div>${info}</div>`);

  newWorklogEntry.appendChild(worklogDate);
  newWorklogEntry.appendChild(worklogId);
  newWorklogEntry.appendChild(worklogInfo);

  return newWorklogEntry;
}
