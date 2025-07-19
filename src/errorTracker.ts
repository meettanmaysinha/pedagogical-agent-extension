import { CodeCell } from '@jupyterlab/cells';
import { IOutputAreaModel } from '@jupyterlab/outputarea';

// Global error count
let executionErrorCount = 0;

// Map to track errors per cell
const cellErrorCounts = new Map<string, number>();
const lastErrorTimestamps = new Map<string, number>();
const errorIntervals = new Map<string, number>();

// WeakSet to track processed cells
const processedCells = new WeakSet<CodeCell>();

/**
 * Sets up error tracking for a given code cell.
 * @param codeCell The code cell to track.
 */
export function trackCellErrors(codeCell: CodeCell): void {
  // Skip cells we've already processed
  if (processedCells.has(codeCell)) {
    return;
  }

  processedCells.add(codeCell);

  const cellId = codeCell.model.id;

  // Initialize error count and timestamps for this cell
  if (!cellErrorCounts.has(cellId)) {
    cellErrorCounts.set(cellId, 0);
  }

  const outputModel = codeCell.outputArea.model;

  // Listen for output changes
  outputModel.changed.connect((model: IOutputAreaModel, args: any) => {
    if (args.type === 'add') {
      const newOutput = model.get(args.newIndex);

      try {
        const outputData = newOutput.toJSON();

        if (outputData && outputData.output_type === 'error') {
          const currentTime = Date.now();

          // Track error timestamps and intervals
          if (lastErrorTimestamps.has(cellId)) {
            const lastTime = lastErrorTimestamps.get(cellId)!;
            errorIntervals.set(cellId, currentTime - lastTime);
          }
          lastErrorTimestamps.set(cellId, currentTime);

          // Increment global and cell-specific error counts
          executionErrorCount++;
          const currentCellErrors = cellErrorCounts.get(cellId) || 0;
          cellErrorCounts.set(cellId, currentCellErrors + 1);

          // console.log(`Global Error Count: ${executionErrorCount}`);
          // console.log(
          //   `Cell ${cellId} Error Count: ${cellErrorCounts.get(cellId)}`
          // );
          // console.log(
          //   `Cell ${cellId} Time Since Last Error: ${
          //     errorIntervals.has(cellId)
          //       ? (errorIntervals.get(cellId)! / 1000).toFixed(2)
          //       : 'not available'
          //   } seconds`
          // );

          // Add UI indication (optional)
          codeCell.node.classList.add('has-execution-error');
        } else {
          // If the output is not an error, reset the cell's error count and clear timestamp
          if (cellErrorCounts.get(cellId) && cellErrorCounts.get(cellId)! > 0) {
            executionErrorCount -= cellErrorCounts.get(cellId)!;
            cellErrorCounts.set(cellId, 0);
            lastErrorTimestamps.delete(cellId); // Reset last error timestamp
            errorIntervals.delete(cellId); // Reset error interval
            console.log(
              `Cell ${cellId} executed successfully. Error count reset.`
            );
          }

          // Remove UI error indication
          codeCell.node.classList.remove('has-execution-error');
        }
      } catch (e) {
        console.error('Error checking output type:', e);
      }
    }
  });
}

/**
 * Retrieves the total number of execution errors.
 * @returns The total error count.
 */
export function getExecutionErrorCount(): number {
  return executionErrorCount;
}

/**
 * Retrieves the error count for a specific cell.
 * @param cellId The ID of the cell.
 * @returns The error count for that cell.
 */
export function getCellErrorCount(cellId: string): number {
  return cellErrorCounts.get(cellId) || 0;
}

/**
 * Retrieves the time interval between the last two errors for a cell.
 * @param cellId The ID of the cell.
 * @returns The time interval in milliseconds, or null if unavailable.
 */
export function getErrorInterval(cellId: string): number | null {
  const interval = errorIntervals.get(cellId);
  return interval !== undefined ? interval / 1000 : null;
}

/**
 * Retrieves all cell error counts.
 * @returns A map of cell IDs to their respective error counts.
 */
export function getAllCellErrorCounts(): Map<string, number> {
  return new Map(cellErrorCounts);
}

/**
 * Resets the error count and error interval for a specific cell.
 * @param cellId The ID of the cell.
 */
export function resetCellErrorCount(cellId: string): void {
    if (cellErrorCounts.has(cellId)) {
      executionErrorCount -= cellErrorCounts.get(cellId)!;
      cellErrorCounts.set(cellId, 0);
    }
    lastErrorTimestamps.delete(cellId);
    errorIntervals.delete(cellId);
  }