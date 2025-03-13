import { JupyterFrontEnd } from '@jupyterlab/application';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { CodeCell } from '@jupyterlab/cells';
import { ButtonExtension } from './button';
import { trackCellErrors } from './errorTracker';

const plugin = {
  id: 'jupyterlab_pedagogical_agent',
  autoStart: true,
  requires: [INotebookTracker, IDocumentManager],
  activate: function (
    app: JupyterFrontEnd,
    notebookTracker: INotebookTracker,
    documentManager: IDocumentManager
  ) {
    console.log('Activating Pedagogical Agent Extension.');

    app.docRegistry.addWidgetExtension(
      'Notebook',
      new ButtonExtension(app.shell, notebookTracker, documentManager)
    );

    // Listen for new notebooks
    notebookTracker.widgetAdded.connect((_, notebookPanel: NotebookPanel) => {
      notebookPanel.sessionContext.ready.then(() => {
        const notebook = notebookPanel.content;

        // Track errors for existing cells
        notebook.widgets.forEach(cell => {
          if (cell.model.type === 'code') {
            trackCellErrors(cell as CodeCell);
          }
        });

        // Track errors for new cells
        if (notebook.model) {
          notebook.model.cells.changed.connect(() => {
            notebook.widgets.forEach(cell => {
              if (cell.model.type === 'code') {
                trackCellErrors(cell as CodeCell);
              }
            });
          });
        }
      });
    });
  }
};

export default plugin;
