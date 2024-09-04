import { JupyterFrontEnd } from '@jupyterlab/application';
import { ToolbarButton } from '@jupyterlab/apputils';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { IDisposable, DisposableDelegate } from '@lumino/disposable';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { Widget } from '@lumino/widgets';
import {
  NotebookPanel,
  INotebookModel,
  INotebookTracker
} from '@jupyterlab/notebook';
import { MainContainer } from './mainContainer';

export class ButtonExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  // This maps each mainContainer object to a notebook title
  mainContainerMap: Map<string, MainContainer>;
  shell: JupyterFrontEnd.IShell;
  notebookTracker: INotebookTracker;
  documentManager: IDocumentManager;

  constructor(
    shell: JupyterFrontEnd.IShell,
    notebookTracker: INotebookTracker,
    documentManager: IDocumentManager
  ) {
    this.shell = shell;
    this.mainContainerMap = new Map<string, MainContainer>();
    this.notebookTracker = notebookTracker;
    this.documentManager = documentManager;
  }

  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    /**
     * Handler for the click event.
     */
    const onClickHandler = () => {
      // Check if we have already created main container
      const curPath = context.path;

      // Create it if we don't have it yet
      if (!this.mainContainerMap?.has(curPath)) {
        this.mainContainerMap?.set(curPath, new MainContainer(panel));
      }

      const curMainContainer = this.mainContainerMap?.get(curPath);

      // Check if we should show or hide this container
      if (curMainContainer?.isHidden()) {
        curMainContainer?.show();
      } else {
        curMainContainer?.hide();
      }
    };

    const button = new ToolbarButton({
      className: 'main-container-button',
      iconClass: 'fas fa-chalkboard-teacher',
      onClick: onClickHandler,
      tooltip: 'Show/Hide Chat'
    });

    // const numItems = toArray(panel.toolbar.children()).length;
    const insertIndex = 10;
    panel.toolbar.insertItem(insertIndex, 'mainContainer', button);

    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}
