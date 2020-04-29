export default function createNewElement(htmlTag, elementClass, innerContent = '') {
  const element = document.createElement(htmlTag);
  element.className = elementClass;
  element.innerHTML = innerContent;
  return element;
}
