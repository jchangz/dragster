import { useEffect, useRef } from "react";
import { clamp } from "lodash";

export function useCalculations({
  order,
  maxCols,
  maxRows,
  gridColumnWidth,
  gridRowHeights,
  gridOffsetFromTop,
}) {
  const currentMaxHeightPerRow = useRef<Array<number>>([]);
  const offsetTopOfRows = useRef<Array<number>>([]);

  useEffect(() => {
    offsetTopOfRows.current = new Array(maxRows.current).fill(
      gridOffsetFromTop.current
    );
  }, [maxRows, gridOffsetFromTop]);

  useEffect(() => {
    const rowHeightObj: { [id: number]: number } = {};
    order.forEach((val: number, i: number) => {
      const rowNum = Math.ceil((i + 1) / maxCols);
      if (!rowHeightObj[rowNum])
        rowHeightObj[rowNum] = gridRowHeights.current[val];
      else {
        if (gridRowHeights.current[val] > rowHeightObj[rowNum]) {
          rowHeightObj[rowNum] = gridRowHeights.current[val];
        }
      }
    });

    currentMaxHeightPerRow.current = Object.values(rowHeightObj);
  }, [order, maxCols, gridRowHeights]);

  const calcNewOffsetTopOfRows = () => {
    for (let i = 1; i < maxRows.current; i += 1) {
      offsetTopOfRows.current[i] =
        offsetTopOfRows.current[i - 1] + currentMaxHeightPerRow.current[i - 1];
    }
  };

  const calcNewCol = ({
    currentCol,
    mx,
  }: {
    currentCol: number;
    mx: number;
  }) => {
    return Math.abs(
      clamp(
        Math.round(mx / gridColumnWidth.current + currentCol),
        0,
        maxCols - 1
      )
    );
  };

  const calcNewRow = ({
    originalIndex,
    currentRow,
    my,
  }: {
    originalIndex: number;
    currentRow: number;
    my: number;
  }) => {
    for (let i = 0; i < maxRows.current; i += 1) {
      // Calculate and return the new row
      if (
        offsetTopOfRows.current[i + 1] &&
        offsetTopOfRows.current[currentRow] + my <
          offsetTopOfRows.current[i + 1] -
            gridRowHeights.current[originalIndex] / 2
      ) {
        return i;
      }
    }
    // When we are in the last row
    return offsetTopOfRows.current.length - 1;
  };

  const calcNewIndex = ({
    newCol,
    newRow,
  }: {
    newCol: number;
    newRow: number;
  }) => {
    return clamp(newRow * maxCols + newCol, 0, order.length - 1);
  };

  return {
    currentMaxHeightPerRow,
    calcNewCol,
    calcNewRow,
    calcNewIndex,
    calcNewOffsetTopOfRows,
  };
}