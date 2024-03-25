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
  chatBox: HTMLElement;
  chatInput: HTMLTextAreaElement;
  chatButton: HTMLButtonElement;
  static numDz = 0;

  constructor(stickyContent: StickyContent) {
    this.stickyContent = stickyContent;
    this.doseReceiveDrop = true;

    // Add a agent element (providing feedback of drag-and-drop)
    this.node = document.createElement('div');
    this.node.classList.add('agent');
    this.stickyContent.contentNode.append(this.node);

    // Add a chat box
    this.chatBox = document.createElement('span') as HTMLElement;
    this.chatBox.classList.add('agent-chat-box');
    this.node.append(this.chatBox);

    if (this.node.getElementsByClassName('agent-chat-box').length === 0) {
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
    }
    // else {
    //   // // Add chat messages
    //   // for (let i = 0; i < 10; i++) {
    //   //   const chatMessage = document.createElement('div');
    //   //   chatMessage.classList.add('chat-message');
    //   //   chatMessage.innerText = `Chat Message ${i}`;
    //   //   this.chatBox.append(chatMessage);
    //   // }
    // }

    // Add bottom container
    const bottomContainer = document.createElement('span');
    bottomContainer.classList.add('agent-bottom-container');
    this.node.append(bottomContainer);

    // Add a chat bar
    const chatContainer = document.createElement('div');
    chatContainer.classList.add('agent-chat-container');
    bottomContainer.append(chatContainer);

    this.chatInput = document.createElement('textarea') as HTMLTextAreaElement;
    this.chatInput.classList.add('agent-chat-input');
    chatContainer.append(this.chatInput);
    // Auto resize textarea based on content
    this.chatInput.addEventListener('input', function () {
      this.style.height = '22px';
      this.style.height = this.scrollHeight + 'px';
    });

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
    this.chatButton.innerText = 'Send';
    this.chatButton.addEventListener('click', this.buttonClickHandler);
    this.chatInput.addEventListener('keydown', this.enterKeyHandler);
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

  // Adds a new message to the chat box, depending on role
  addMessageHandler = (role: string, message: string) => {
    const chatMessage = document.createElement('div');
    const chatRole = document.createElement('div');
    chatMessage.classList.add('chat-message');
    if (role === 'system') {
      chatRole.classList.add('system-role');
      chatRole.innerText = 'System';
    } else if (role === 'user') {
      chatRole.classList.add('user-role');
      chatRole.innerText = 'You';
    }
    chatMessage.innerText = message;
    this.chatBox.append(chatRole);
    this.chatBox.append(chatMessage);
  };

  /**
   * Handle keyboard enter in the chat input
   * @param event Keyboard press event
   */
  enterKeyHandler = (event: KeyboardEvent) => {
    // Check for enter key
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent line break
      // Get the message from the input box and add to chat box
      const message = this.chatInput.value;
      this.chatInput.value = '';
      this.chatInput.style.height = ''; // Return input box to original size
      this.addMessageHandler('user', message);
      this.chatBox.scrollTop = this.chatBox.scrollHeight; // Scroll to the bottom
    }
  };

  /**
   * Handle mouse click on the send button
   * @param event Mouse movement event
   */
  buttonClickHandler = (event: MouseEvent) => {
    // Get the message from the input box and add to chat box
    const message = this.chatInput.value;
    this.chatInput.value = '';
    this.chatInput.style.height = ''; // Return input box to original size
    this.addMessageHandler('user', message);
    this.chatBox.scrollTop = this.chatBox.scrollHeight; // Scroll to the bottom

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
