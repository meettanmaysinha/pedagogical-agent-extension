import { IDisposable } from '@lumino/disposable';
import { IDragEvent } from '@lumino/dragdrop';
import { NotebookPanel } from '@jupyterlab/notebook';
import { CodeCell, MarkdownCell, Cell } from '@jupyterlab/cells';
import { AgentContent, ContentType } from './content';
import { MyIcons } from './icons';
import axios from 'axios';
import { getCellErrorCount, getErrorInterval } from './errorTracker';
import { marked } from 'marked';

/**
 * Class that implements the Agent state where the AgentContent is empty
 * and waiting for users to drop some cells.
 */
export class Agent implements IDisposable {
  agentContent: AgentContent;
  node: HTMLElement;
  isDisposed = false;
  chatBox: HTMLElement;
  chatInput: HTMLTextAreaElement;
  chatButton: HTMLButtonElement;
  doseReceiveDrop: boolean;
  static numDz = 0;
  currentCellMetadata: any = null;

  constructor(agentContent: AgentContent) {
    console.log('Agent constructed');
    this.agentContent = agentContent;

    // Add an agent element
    this.node = document.createElement('div');
    this.node.classList.add('agent');
    this.agentContent.contentNode.append(this.node);

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
    this.chatInput.placeholder = 'Type your message here...';

    this.chatInput.style.minHeight = '50px';
    this.chatInput.rows = 3;

    chatContainer.append(this.chatInput);

    // Auto resize textarea based on content
    this.chatInput.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    });

    // Handle drag-drop resizing issue
    this.chatInput.addEventListener('drop', function () {
      setTimeout(() => {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
      }, 0);
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
      chatMessage.classList.add('system-message');
      chatRole.innerText = 'Learning Companion';

      // Initially set the message text to empty
      chatMessage.innerText = '';

      // First append the elements to the DOM
      this.chatBox.append(chatRole);
      this.chatBox.append(chatMessage);

      // Parse the message first so we have the HTML version ready
      const parsedMessage = await Promise.resolve(marked.parse(message));

      // Extract text content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = parsedMessage;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';

      // Create a buffer for faster updates
      let displayText = '';
      let chunkSize = 3; // Process multiple characters per update
      let i = 0;

      // Use requestAnimationFrame for smoother performance
      const animateTyping = () => {
        // Add a chunk of characters
        const endIndex = Math.min(i + chunkSize, textContent.length);
        displayText += textContent.substring(i, endIndex);
        chatMessage.innerText = displayText;

        i = endIndex;

        // Only scroll occasionally to reduce layout calculations
        if (i % 20 === 0 || i >= textContent.length) {
          this.chatBox.scrollTop = this.chatBox.scrollHeight;
        }

        // Check if we're done
        if (i < textContent.length) {
          setTimeout(() => requestAnimationFrame(animateTyping), 15);
        } else {
          // Animation complete, set final formatted HTML
          chatMessage.innerHTML = parsedMessage;
          this.chatBox.scrollTop = this.chatBox.scrollHeight;
        }
      };

      // Start the animation
      requestAnimationFrame(animateTyping);
    } else if (role === 'user') {
      chatRole.classList.add('user-role');
      chatMessage.classList.add('user-message'); // add role-specific class
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
  addCellMessageHandler = async (cellContent: any) => {
    var newLine = '';
    if (this.chatInput.value != '') newLine = '\n';
    this.chatInput.value += newLine + cellContent.source;
    this.chatInput.scrollTop = this.chatInput.scrollHeight;
  };

  /**
   * Retrieves message from Agent's LLM
   * @param message Content of message
   */
  queryResponse = async (content: string) => {
    // TODO: Implement LLM connection
    console.log('Querying...');

    let help_level = 'default';
    let errorMessage = null;
    let reasoning =
      'Help level set to default because no error count or interval was found';
    let dragAndDrop = false;

    // Adding hint level to the message (if available)
    if (this.currentCellMetadata != null) {
      // content += '\n\n\n';
      // content += 'help_level: ' + this.currentCellMetadata.help_level;
      // content += '\n';
      help_level = this.currentCellMetadata.help_level;
      reasoning = this.currentCellMetadata.help_level_reasoning;
      dragAndDrop = this.currentCellMetadata.drag_and_drop;

      // Check for error output. If applicable, add error message to the content
      const outputs = this.currentCellMetadata.outputs;
      if (Array.isArray(outputs)) {
        const errorOutput = outputs.find(
          output => output.output_type === 'error'
        );
        if (errorOutput) {
          errorMessage = `${errorOutput.ename}: ${errorOutput.evalue}`;
        }
      }
    }

    if (errorMessage) {
      content += '\n\n' + errorMessage;
    }

    // console.log('Dragged and dropped? ' + dragAndDrop);
    // console.log('Help level reasoning: ' + reasoning);

    this.currentCellMetadata = null;
    const agentAPIEndPoint = 'http://localhost:8000/api/chat';
    const agentResponse = await axios.post(agentAPIEndPoint, {
      message_content: content,
      help_level: help_level,
      help_level_reasoning: reasoning,
      drag_and_drop: dragAndDrop
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
      if (message) {
        this.chatInput.value = '';
        this.chatInput.style.height = ''; // Return input box to original size
        this.addMessageHandler('user', message);
        this.chatBox.scrollTop = this.chatBox.scrollHeight; // Scroll to the bottom
      }
    }
  };

  /**
   * Handle mouse click on the send button
   * @param event Mouse movement event
   */
  buttonClickHandler = (event: MouseEvent) => {
    // Get the message from the input box and add to chat box
    const message = this.chatInput.value;
    if (message) {
      this.chatInput.value = '';
      this.chatInput.style.height = ''; // Return input box to original size
      this.addMessageHandler('user', message);
      this.chatBox.scrollTop = this.chatBox.scrollHeight; // Scroll to the bottom
    }
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

      // Hint level based on error count and interval
      // More errors == more help
      // Lower interval between errors == less help
      const cellId = cell.model.id;
      const errorCount = getCellErrorCount(cellId);
      const errorInterval = getErrorInterval(cellId);

      const helpLevelMap = ['hint', 'guided', 'comprehensive'];
      let helpLevelIndex = 0;
      let reasoning = '';
      if (errorCount > 5) {
        helpLevelIndex = 2;
        reasoning =
          'Help level set to comprehensive because error count is more than 5';
      } else if (errorCount > 3) {
        helpLevelIndex = 1;
        reasoning =
          'Help level set to guided because error count is more than 3 and less than 5';
      } else {
        helpLevelIndex = 0;
        reasoning = 'Help level set to hint because error count is less than 3';
      }

      if (errorInterval) {
        if (errorInterval < 120) {
          // helpLevelIndex = Math.max(helpLevelIndex - 1, 0);
          if (helpLevelIndex > 0) {
            helpLevelIndex -= 1;
            reasoning += `, but lowered to ${helpLevelMap[helpLevelIndex]} because error interval is less than 2 minutes`;
          }
        }
      }

      const extractedCellInfo = {
        id: cellInformation.id, // id of cell
        source: cellInformation.source, // Content inside the cell
        execution_count: cellInformation.execution_count, // Number of times cell was executed
        outputs: cellInformation.outputs, // Output information - Shows error details if cell has error
        error_count: errorCount, // Number of errors in the cell
        error_interval: errorInterval, // Time interval between last two errors
        help_level: helpLevelMap[helpLevelIndex], // Help level based on error count and interval
        help_level_reasoning: reasoning, // Reasoning for help level
        drag_and_drop: true // Flag to indicate that this is a drag and drop event
      };
      this.addCellMessageHandler(extractedCellInfo);
      this.currentCellMetadata = extractedCellInfo;
    } else {
      //   cell = notebook.content.activeCell as MarkdownCell;
      //   cellContentType = ContentType.Markdown;
      cell = event.source.activeCell;
      // this.addMessageHandler('assistant', 'Markdown dropped'); // Markdown cell not used
    }

    this.chatBox.scrollTop = this.chatBox.scrollHeight; // Scroll to the bottom
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
