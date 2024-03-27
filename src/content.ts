import { IDisposable } from '@lumino/disposable';
import { IDragEvent } from '@lumino/dragdrop';
import { NotebookPanel } from '@jupyterlab/notebook';
import { CodeCell, MarkdownCell, Cell } from '@jupyterlab/cells';

import { Agent } from './agent';
import { StickyLand } from './stickyland';

export enum ContentType {
  Agent = 'Agent',
  Code = 'Code',
  Markdown = 'Markdown'
}

export class StickyContent implements IDisposable {
  stickyContainer: HTMLElement;
  wrapperNode: HTMLElement;
  headerNode: HTMLElement;
  contentNode: HTMLElement;
  curContent: Agent;
  notebook: NotebookPanel;
  stickyLand: StickyLand;
  isDisposed = false;

  constructor(
    stickyContainer: HTMLElement,
    panel: NotebookPanel,
    stickyLand: StickyLand
  ) {
    this.stickyContainer = stickyContainer;
    this.notebook = panel;
    this.stickyLand = stickyLand;

    // Add the content element
    this.wrapperNode = document.createElement('div');
    this.wrapperNode.classList.add('sticky-content');
    this.stickyContainer.appendChild(this.wrapperNode);

    // Add a header and a content
    this.headerNode = document.createElement('div');
    this.headerNode.classList.add('header');
    this.wrapperNode.appendChild(this.headerNode);

    this.contentNode = document.createElement('div');
    this.contentNode.classList.add('content');
    this.wrapperNode.appendChild(this.contentNode);

    // Show an agent at first
    this.curContent = new Agent(this);
  }

  /**
   * Replace the current content with an agent
   */
  showAgent = () => {
    this.curContent = new Agent(this);
  };

  // swapToAgent = () => {
  //   // Dispose the current content
  //   this.curContent.closeClicked();
  // };

  /**
   * Handle drag enter according to the current content type
   * @param event Lumino IDragEvent
   */
  dragEnterHandler = (event: IDragEvent) => {
    if (this.curContent instanceof Agent) {
      this.curContent.dragEnterHandler(event);
    }
  };

  /**
   * Handle drag over according to the current content type
   * @param event Lumino IDragEvent
   */
  dragOverHandler = (event: IDragEvent) => {
    if (this.curContent instanceof Agent) {
      this.curContent.dragOverHandler(event);
    }
  };

  // /**
  //  * Handle drop leave according to the current content type
  //  * @param event Lumino IDragEvent
  //  */
  dragDropHandler = (event: IDragEvent) => {
    if (this.curContent instanceof Agent) {
      this.curContent.dragDropHandler(event);
    }
  };

  /**
   * Handle drag leave according to the current content type
   * @param event Lumino IDragEvent
   */
  dragLeaveHandler = (event: IDragEvent) => {
    if (this.curContent instanceof Agent) {
      this.curContent.dragLeaveHandler(event);
    }
  };
  dispose = () => {
    // Dispose the current content
    // this.curContent.closeClicked();

    // Dispose the agent
    this.curContent.dispose();
    this.wrapperNode.remove();
    this.isDisposed = true;
  };
}
