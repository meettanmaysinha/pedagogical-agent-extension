import { IDisposable } from '@lumino/disposable';
import { NotebookActions } from '@jupyterlab/notebook';
import { NotebookPanel, Notebook } from '@jupyterlab/notebook';
import { Cell, ICellModel } from '@jupyterlab/cells';
import { StickyContent } from './content';
import { StickyLand } from './stickyland';
import { ContentType } from './content';
import { MyIcons } from './icons';

export type Tab = {
  cellType: ContentType;
  cellIndex: number;
  tabNode: HTMLElement;
  tabContent: StickyContent;
  hasNewUpdate: boolean;
};

export class StickyTab implements IDisposable {
  stickyContainer: HTMLElement;
  stickyLand: StickyLand;
  notebook: NotebookPanel;
  activeTab: Tab | null = null;
  tabs: Tab[] = [];

  autoRunTimeout: number | null = null;
  autoRunningCellNodes: Set<HTMLElement> = new Set([]);
  autoRunTabs = new Array<Tab>();
  isDisposed = false;

  constructor(
    stickyContainer: HTMLElement,
    panel: NotebookPanel,
    stickyLand: StickyLand
  ) {
    this.stickyContainer = stickyContainer;
    this.stickyLand = stickyLand;
    this.notebook = panel;

    // Create the first tab
    this.createTab();
  }

  /**
   * Create a tab containing a dropzone content. The tab name is always 'new'
   * for new tabs. Creating a different content (after interacting with the
   * dropzone will update the tab name).
   * @returns New tab
   */
  createTab = (): Tab => {
    // Create a new tab node
    const tabNode = document.createElement('button');
    tabNode.classList.add('tab', 'new-tab');
    tabNode.setAttribute('title', 'New tab');

    // New tab always has the dropzone content
    const tabContent = new StickyContent(
      this.stickyContainer,
      this.notebook,
      this.stickyLand
    );

    // Add this tab to the model and view
    const newTab: Tab = {
      cellType: ContentType.Agent,
      cellIndex: 0,
      tabNode: tabNode,
      tabContent: tabContent,
      hasNewUpdate: false
    };

    // Return this tab
    return newTab;
  };

  dispose = () => {
    this.isDisposed = true;
  };
}
