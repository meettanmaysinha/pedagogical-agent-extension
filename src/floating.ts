import { IDisposable } from '@lumino/disposable';
import { ContentType } from './content';
import { StickyTab, Tab } from './tab';
import { StickyLand } from './stickyland';
import { MyIcons } from './icons';
import { Agent } from './agent';

type Position = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Size = {
  width: number;
  height: number;
};

const WINDOW_GAP = 5;

/**
 * Class that implements the Code cell in StickyLand.
 */
export class FloatingWindow implements IDisposable {
  container: HTMLElement | null;
  containerSize: Size;
  node: HTMLElement;
  agent: Agent;
  stickyTab: StickyTab;
  stickyLand: StickyLand;
  tab: Tab | null;
  header: HTMLElement;
  cellType: ContentType;
  isDisposed = false;
  lastMousePos = [0, 0];

  constructor(cellType: ContentType, agent: Agent) {
    // Create the floating window element
    this.node = document.createElement('div');
    this.node.classList.add('floating-window', 'hidden');

    // Append the floating window to different elements for notebook/lab
    if (document.querySelector('#jp-main-content-panel') !== null) {
      this.container = document.querySelector('#jp-main-content-panel');
    } else {
      this.container = document.querySelector('#main-panel');
    }
    this.container?.appendChild(this.node);

    if (this.container === null) {
      console.warn(
        'StickyLand: Cannot find container to inject the floating cell!'
      );
    }

    // Set max size to bound the floating window
    this.containerSize = {
      width: 2000,
      height: 1500
    };
    if (this.container !== null) {
      const containerBBox = this.container.getBoundingClientRect();
      this.containerSize.width = containerBBox.width;
      this.containerSize.height = containerBBox.height;
    }

    // Add a top header to the window
    this.header = document.createElement('div');
    this.header.classList.add('floating-header');
    this.node.appendChild(this.header);

    const headerText = document.createElement('span');
    this.cellType = cellType;
    this.agent = agent;
    this.stickyTab = this.agent.stickyContent.stickyLand.stickyTab;
    this.tab = this.stickyTab.activeTab;
    this.stickyLand = this.agent.stickyContent.stickyLand;

    // We first put the cell on the left edge of the notebook panel
    const initLeft = this.agent.node.getBoundingClientRect().x + 10;

    // Position the node to the inner region and offset it a little bit when
    // users create multiple windows
    const curLeft = initLeft + this.stickyLand.floatingWindows.length * 20;
    const curTop = 100 + this.stickyLand.floatingWindows.length * 20;
    this.node.style.left = `${curLeft}px`;
    this.node.style.top = `${curTop}px`;

    this.node.style.maxWidth = `${
      this.containerSize.width - curLeft - WINDOW_GAP
    }px`;
    this.node.style.maxHeight = `${
      this.containerSize.height - curTop - WINDOW_GAP
    }px`;

    // Query the cell index for this cell
    let cellIndex = 1;
    if (this.stickyTab.activeTab) {
      cellIndex = this.stickyTab.activeTab.cellIndex;
    }

    if (cellType === ContentType.Code) {
      headerText.innerText = `Code-${cellIndex}`;
    } else {
      headerText.innerText = `Markdown-${cellIndex}`;
    }
    this.header.appendChild(headerText);

    // Allow users to drag the window to change the position
    this.header.addEventListener('mousedown', this.headerMousedownHandler);

    // Add the content from the cell to the floating window
    const floatingContent = this.agent.stickyContent.wrapperNode.cloneNode(
      false
    ) as HTMLElement;
    floatingContent.append(...this.agent.stickyContent.wrapperNode.childNodes);
    this.node.append(floatingContent);

    // Set the initial width to fit the codemirror default width
    const cmSizer = this.node.querySelector(
      '.CodeMirror-sizer'
    ) as HTMLElement | null;

    if (cmSizer !== null) {
      this.node.style.width = `${parseInt(cmSizer.style.minWidth) + 20}px`;
    }
  }

  /**
   * Event handler for mouse down. It trigger the document to listen to mouse
   * move events
   * @param e Event
   */
  headerMousedownHandler = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    const mouseEvent = e as MouseEvent;

    // Raise the clicked window
    this.node.parentNode?.appendChild(this.node);

    // Create a window size mask so that we can override the codemirror cursor
    const cursorMask = document.createElement('div');
    cursorMask.classList.add('cursor-mask');
    cursorMask.style.cursor = 'move';
    document.body.appendChild(cursorMask);

    // Also need to mask the internal region
    const innerCursorMask = document.createElement('div');
    innerCursorMask.classList.add('cursor-mask');
    innerCursorMask.style.cursor = 'move';
    this.node.appendChild(innerCursorMask);

    // Register the offset from the initial click position to the div location
    this.lastMousePos = [mouseEvent.pageX, mouseEvent.pageY];

    const mouseMoveHandler = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const mouseEvent = e as MouseEvent;

      let newX = this.node.offsetLeft + mouseEvent.pageX - this.lastMousePos[0];
      let newY = this.node.offsetTop + mouseEvent.pageY - this.lastMousePos[1];

      this.lastMousePos[0] = mouseEvent.pageX;
      this.lastMousePos[1] = mouseEvent.pageY;

      const nodeBBox = this.node.getBoundingClientRect();

      // Bound x and y so the window is not out of its container
      const maxNewX = this.containerSize.width - nodeBBox.width - WINDOW_GAP;
      newX = Math.max(0, newX);
      newX = Math.min(maxNewX, newX);

      const maxNewY = this.containerSize.height - nodeBBox.height - WINDOW_GAP;
      newY = Math.max(0, newY);
      newY = Math.min(maxNewY, newY);

      this.node.style.left = `${newX}px`;
      this.node.style.top = `${newY}px`;

      // Also bound the max width and max height to avoid resize overflow
      if (newX !== maxNewX) {
        this.node.style.maxWidth = `${
          this.containerSize.width - newX - WINDOW_GAP
        }px`;
      }

      if (newY !== maxNewY) {
        this.node.style.maxHeight = `${
          this.containerSize.height - newY - WINDOW_GAP
        }px`;
      }
    };

    const mouseUpHandler = () => {
      document.removeEventListener('mousemove', mouseMoveHandler, true);
      document.removeEventListener('mouseup', mouseUpHandler, true);
      document.body.style.cursor = 'default';
      cursorMask.remove();
      innerCursorMask.remove();
    };

    // Bind the mouse event listener to the document so we can track the movement
    // if outside the header region
    document.addEventListener('mousemove', mouseMoveHandler, true);
    document.addEventListener('mouseup', mouseUpHandler, true);
    document.body.style.cursor = 'move';
  };

  dispose() {
    this.header.removeEventListener('mousedown', this.headerMousedownHandler);
    this.node.remove();
    this.isDisposed = true;
  }
}
