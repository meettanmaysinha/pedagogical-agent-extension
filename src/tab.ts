import { IDisposable } from '@lumino/disposable';
import { NotebookActions } from '@jupyterlab/notebook';
import { NotebookPanel, Notebook } from '@jupyterlab/notebook';
import { Cell, ICellModel } from '@jupyterlab/cells';
import { StickyContent } from './content';
import { MainContainer } from './mainContainer';
import { ContentType } from './content';
import { MyIcons } from './icons';

export type Tab = {
  cellType: ContentType;
  cellIndex: number;
  tabNode: HTMLElement;
  tabContent: StickyContent;
  hasNewUpdate: boolean;
};

export class ContentTab implements IDisposable {
  stickyContainer: HTMLElement;
  mainContainer: MainContainer;
  notebook: NotebookPanel;
  tabContent: StickyContent;
  activeTab: Tab | null = null;

  autoRunTimeout: number | null = null;
  autoRunningCellNodes: Set<HTMLElement> = new Set([]);
  autoRunTabs = new Array<Tab>();
  isDisposed = false;

  constructor(
    stickyContainer: HTMLElement,
    panel: NotebookPanel,
    mainContainer: MainContainer
  ) {
    console.log('Tab Constructed');
    this.stickyContainer = stickyContainer;
    this.mainContainer = mainContainer;
    this.notebook = panel;

    // Create the first tab
    this.tabContent = this.createTab().tabContent;
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
      this.mainContainer
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
