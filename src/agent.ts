import { IDisposable } from '@lumino/disposable';
import { IDragEvent } from '@lumino/dragdrop';
import { NotebookPanel } from '@jupyterlab/notebook';
import { CodeCell, MarkdownCell, Cell } from '@jupyterlab/cells';
import { StickyContent, ContentType } from './content';
import { MyIcons } from './icons';
import axios from 'axios';

/**
 * Class that implements the Agent state where the StickyContent is empty
 * and waiting for users to drop some cells.
 */
export class Agent implements IDisposable {
  stickyContent: StickyContent;
  node: HTMLElement;
  isDisposed = false;
  chatBox: HTMLElement;
  chatInput: HTMLTextAreaElement;
  chatButton: HTMLButtonElement;
  doseReceiveDrop: boolean;
  static numDz = 0;

  constructor(stickyContent: StickyContent) {
    console.log('Agent constructed');
    this.stickyContent = stickyContent;

    // Add an agent element
    this.node = document.createElement('div');
    this.node.classList.add('agent');
    this.stickyContent.contentNode.append(this.node);

    // Add a chat box
    this.chatBox = document.createElement('span') as HTMLElement;
    this.chatBox.classList.add('agent-chat-box');
    this.node.append(this.chatBox);

    this.doseReceiveDrop = false;

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

    this.chatButton = document.createElement('button') as HTMLButtonElement;
    this.chatButton.classList.add('agent-button', 'button');
    bottomContainer.append(this.chatButton);
    this.chatButton.type = 'button';
    this.chatButton.innerText = 'Send';
    this.chatButton.addEventListener('click', this.buttonClickHandler);
    this.chatInput.addEventListener('keydown', this.enterKeyHandler);
  }

  /**
   * Adds a new message to the chat box, depending on role
   * @param role Role of sender (user, assistant)
   * @param message Content of message
   */
  addMessageHandler = async (role: string, message: string) => {
    const chatMessage = document.createElement('div');
    const chatRole = document.createElement('div');
    chatMessage.classList.add('chat-message');
    if (role === 'assistant') {
      chatRole.classList.add('system-role');
      chatRole.innerText = 'Assistant';
      chatMessage.innerText = message;
      this.chatBox.append(chatRole);
      this.chatBox.append(chatMessage);
      // this.streamChat(message, 0, chatMessage); // To be implemented if using streaming
    } else if (role === 'user') {
      chatRole.classList.add('user-role');
      chatRole.innerText = 'You';
      chatMessage.innerText = message;
      this.chatBox.append(chatRole);
      this.chatBox.append(chatMessage);
      this.addMessageHandler('assistant', await this.queryResponse(message));
    }
  };

  /**
   * When user drags cell into chat box, add the code cell content into chatbox
   * @param role Role of sender (user, assistant)
   * @param message Content of message
   */
  addCellMessageHandler = async (role: string, cellContent: any) => {
    const chatMessage = document.createElement('div');
    const chatRole = document.createElement('div');
    chatMessage.classList.add('chat-message');
    if (role === 'assistant') {
      chatRole.classList.add('system-role');
      chatRole.innerText = 'Assistant';
      chatMessage.innerText = cellContent.source;
      this.chatBox.append(chatRole);
      this.chatBox.append(chatMessage);
      // this.streamChat(message, 0, chatMessage); // To be implemented if using streaming
    } else if (role === 'user') {
      chatRole.classList.add('user-role');
      chatRole.innerText = 'You';
      chatMessage.innerText = cellContent.source;
      this.chatBox.append(chatRole);
      this.chatBox.append(chatMessage);
      this.addMessageHandler(
        'assistant',
        await this.queryResponse(JSON.stringify(cellContent))
      );
    }
  };

  // // Function to simulate streaming chat effect
  // streamChat = (messages: string, index = 0, chatMessage: HTMLDivElement) => {
  //   if (index < messages.length) {
  //     chatMessage.innerText += messages[index];

  //     // Automatically scroll to the bottom of the chat container
  //     chatMessage.scrollTop = chatMessage.scrollHeight;

  //     // Recursive call with a delay
  //     setTimeout(() => {
  //       this.streamChat(messages, index + 1, chatMessage);
  //     }, 0.1); // Adjust the delay (in milliseconds) as needed
  //   }
  // };

  /**
   * Retrieves message from Agent's LLM
   * @param message Content of message
   */
  queryResponse = async (content: string) => {
    // TODO: Implement LLM connection
    console.log('Querying...');
    const agentAPIEndPoint = 'http://localhost:8000/api/chat';

    const agentResponse = await axios.post(agentAPIEndPoint, {
      message_content: content
    });
    console.log(agentResponse.data.response);
    return agentResponse.data.response;
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
  };

  /**
   * Get information from the notebook cell dropped inside the window
   */
  getDroppedCellInfo = (cell: CodeCell) => {
    console.log('Drop everything now');
    console.log(cell.model.metadata);
    return cell.model.metadata;
  };

  /**
   * Handle drag enter (highlight the border)
   * @param event Lumino IDragEvent
   */
  dragEnterHandler = (event: IDragEvent) => {
    // Highlight the border to indicate dragover
    if (this.doseReceiveDrop) {
      // this.node.classList.add('drag-over');
    }
  };

  /**
   * Handle drag over (highlight the border)
   * @param event Lumino IDragEvent
   */
  dragOverHandler = (event: IDragEvent) => {
    // Highlight the border to indicate dragover
    if (this.doseReceiveDrop) {
      // this.node.classList.add('drag-over');
    }
  };

  /**
   * Handle drag drop (highlight the border)
   * @param event Lumino IDragEvent
   */
  dragDropHandler = (event: IDragEvent) => {
    // Dehighlight the view
    // this.node.classList.remove('drag-over');
    this.doseReceiveDrop = false;

    // Query the notebook information
    const notebook = event.source.parent as NotebookPanel;
    let cell: Cell;
    let cellContentType: ContentType;

    if (event.source.activeCell instanceof CodeCell) {
      cell = notebook.content.activeCell as CodeCell;
      //   cellContentType = ContentType.Code;

      //   cell = event.source.activeCell;
      //   const cellInformation = JSON.stringify(this.getDroppedCellInfo(event.source.activeCell));
      const cellInformation = cell.model.toJSON();
      const extractedCellInfo = {
        id: cellInformation.id, // id of cell
        source: cellInformation.source, // Content inside the cell
        execution_count: cellInformation.execution_count, // Number of times cell was executed
        outputs: cellInformation.outputs // Output information - Shows error details if cell has error
      };
      this.addCellMessageHandler('user', extractedCellInfo);
    } else {
      //   cell = notebook.content.activeCell as MarkdownCell;
      //   cellContentType = ContentType.Markdown;
      cell = event.source.activeCell;
      // this.addMessageHandler('assistant', 'Markdown dropped'); // Markdown cell not used
    }

    this.chatBox.scrollTop = this.chatBox.scrollHeight; // Scroll to the bottom

    // Create a new tab and populate it with the corresponding cell
    // Swap the dropzone with the new tab
    // this.stickyContent.swapDropzoneWithExistingCell(cell, cellContentType);
  };

  /**
   * Handle drag leave (dehighlight the border)
   * @param event Lumino IDragEvent
   */
  dragLeaveHandler = (event: IDragEvent) => {
    // Dehighlight the border to indicate dragover
    this.node.classList.remove('drag-over');
  };

  dispose() {
    this.node.remove();
    this.isDisposed = true;
  }
}
