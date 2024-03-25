import { IDisposable } from '@lumino/disposable';
import { IDragEvent } from '@lumino/dragdrop';
import { NotebookPanel } from '@jupyterlab/notebook';
import { CodeCell, MarkdownCell, Cell } from '@jupyterlab/cells';
import { StickyContent, ContentType } from './content';
import { MyIcons } from './icons';

/**
 * Class that implements the Dropzone state where the StickyContent is empty
 * and waiting for users to drop some cells.
 */
export class Dropzone implements IDisposable {
  stickyContent: StickyContent;
  node: HTMLElement;
  doseReceiveDrop: boolean;
  isDisposed = false;
  chatInput: HTMLInputElement;
  chatButton: HTMLButtonElement;
  static numDz = 0;

  constructor(stickyContent: StickyContent) {
    this.stickyContent = stickyContent;
    this.doseReceiveDrop = true;

    // Add a agent element (providing feedback of drag-and-drop)
    this.node = document.createElement('div');
    this.node.classList.add('agent');
    this.stickyContent.contentNode.append(this.node);

    // Initialize the content

    // Add an icon
    const addIconElem = document.createElement('div');
    addIconElem.classList.add('svg-icon');
    this.node.append(addIconElem);

    MyIcons.addIcon.element({ container: addIconElem });

    // Add a text label
    const label = document.createElement('span');
    label.classList.add('chat-label');
    label.innerText = 'Ask me questions!';
    this.node.append(label);

    // Add bottom container
    const bottomContainer = document.createElement('div');
    bottomContainer.classList.add('agent-bottom-container');
    this.node.append(bottomContainer);

    // Add a chat bar
    const chatContainer = document.createElement('div');
    chatContainer.classList.add('agent-chat-container');
    bottomContainer.append(chatContainer);

    this.chatInput = document.createElement('input') as HTMLInputElement;
    this.chatInput.classList.add('agent-chat-input');
    chatContainer.append(this.chatInput);

    // // Add a small caret down icon (from jp)
    // const chatIcon = document.createElement('span');
    // chatContainer.append(chatIcon);
    // MyIcons.caretDownEmptyIcon.element({
    //   container: chatIcon
    // });

    this.chatButton = document.createElement('button') as HTMLButtonElement;
    this.chatButton.classList.add('agent-button', 'button');
    bottomContainer.append(this.chatButton);
    this.chatButton.type = 'button';
    this.chatButton.innerText = 'Ask';
    this.chatButton.addEventListener('click', this.createClickHandler);

    // // Add options to the select list
    // const newCellOptions = [
    //   { name: 'Select new cell type', type: ContentType.Dropzone },
    //   { name: 'Code', type: ContentType.Code },
    //   { name: 'Markdown', type: ContentType.Markdown }
    // ];

    // newCellOptions.forEach(o => {
    //   const option = document.createElement('option');
    //   option.value = ContentType[o.type];
    //   option.innerText = o.name;
    //   this.select.append(option);
    // });
  }

  /**
   * Handle drag enter (highlight the border)
   * @param event Lumino IDragEvent
   */
  dragEnterHandler = (event: IDragEvent) => {
    // Highlight the border to indicate dragover
    if (this.doseReceiveDrop) {
      this.node.classList.add('drag-over');
    }
  };

  /**
   * Handle drag over (highlight the border)
   * @param event Lumino IDragEvent
   */
  dragOverHandler = (event: IDragEvent) => {
    // Highlight the border to indicate dragover
    if (this.doseReceiveDrop) {
      this.node.classList.add('drag-over');
    }
  };

  /**
   * Handle drag drop (highlight the border)
   * @param event Lumino IDragEvent
   */
  // dragDropHandler = (event: IDragEvent) => {
  //   // Dehighlight the view
  //   this.node.classList.remove('drag-over');
  //   this.doseReceiveDrop = false;

  //   // Query the notebook information
  //   const notebook = event.source.parent as NotebookPanel;
  //   let cell: Cell;
  //   let cellContentType: ContentType;

  //   if (event.source.activeCell instanceof MarkdownCell) {
  //     cell = notebook.content.activeCell as MarkdownCell;
  //     cellContentType = ContentType.Markdown;
  //   } else {
  //     cell = notebook.content.activeCell as CodeCell;
  //     cellContentType = ContentType.Code;
  //   }

  //   // Create a new tab and populate it with the corresponding cell
  //   // Swap the dropzone with the new tab
  //   this.stickyContent.swapDropzoneWithExistingCell(cell, cellContentType);
  // };

  /**
   * Handle drag leave (dehighlight the border)
   * @param event Lumino IDragEvent
   */
  dragLeaveHandler = (event: IDragEvent) => {
    // Dehighlight the border to indicate dragover
    this.node.classList.remove('drag-over');
  };

  /**
   * Implement this function to be consistent with other cell content
   */
  closeClicked = () => {
    // pass
  };

  /**
   * Handle mouse click on the create button
   * @param event Mouse movement event
   */
  createClickHandler = (event: MouseEvent) => {
    console.log('Chat Button Clicked');
    // Query the current value of the cell type dropdown
    // const curOption = <ContentType>this.select.value;
    // switch (curOption) {
    //   case ContentType.Code:
    //     this.stickyContent.swapDropzoneWithNewCell(ContentType.Code);
    //     break;

    //   case ContentType.Markdown:
    //     this.stickyContent.swapDropzoneWithNewCell(ContentType.Markdown);
    //     break;

    //   case ContentType.Dropzone:
    //     // Noop if users do not select a new cell type
    //     break;

    //   default:
    //     break;
    // }
  };

  dispose() {
    this.node.remove();
    this.isDisposed = true;
  }
}
