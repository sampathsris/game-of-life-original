import { createTimedFunction } from "./util";

export const LIVE = 1;
const DEAD = 0;
const MIN_LIVE_NEIGHBORS = 2;
const MAX_LIVE_NEIGHBORS = 3;
const REPRODUCTION_THRESHOLD = 3;

export const makeCells = (columns, rows, threshold) => {
    const totalcells = columns * rows;
    const cells = new Array(totalcells);

    for (let i = 0; i < totalcells; i++) {
        if (!threshold) {
            cells[i] = DEAD;
        } else {
            cells[i] = Math.random() > threshold ? LIVE : DEAD;
        }
    }

    return cells;
};

const EVOLVE = 'EVOLVE';
const TOGGLE_RUNNING = 'TOGGLE_RUNNING';
const TOGGLE_CELL = 'TOGGLE_CELL';
const CLEAR = 'CLEAR';
const RANDOM = 'RANDOM';
const SET_CELL_SIZE = 'SET_CELL_SIZE';
const RESIZE = 'RESIZE';

export function evolve() {
    return {
        type: EVOLVE
    };
}

export function toggleRunning() {
    return {
        type: TOGGLE_RUNNING
    }
}

export function toggleCell(index) {
    return {
        type: TOGGLE_CELL,
        index
    }
}

export function clear() {
    return {
        type: CLEAR
    }
}

export function randomize(threshold) {
    return {
        type: RANDOM,
        threshold
    }
}

export function setCellSize(cellSize) {
    return {
        type: SET_CELL_SIZE,
        cellSize
    }
}

export function resize(columns, rows) {
    return {
        type: RESIZE,
        columns,
        rows
    }
}

const generationsEquals = (cells, nextGenCells) => {
    if (cells.length !== nextGenCells.length) return false;

    for (let i = 0; i < cells.length; i++) {
        if (cells[i] !== nextGenCells[i]) {
            return false;
        }
    }

    return true;
}

export const TILING = {
    coloringFunction: value => value === LIVE ? '#444444' : null
}

export default function createAutomataReducer (columns, rows, cellSize) {
    const nextGenMapper = (cell, neighbors) => {
        let liveNeighbors = neighbors.map(
            neighbor => typeof neighbor === 'undefined' ? 0 : neighbor
        ).reduce(
            (sum, neighbor) => sum + neighbor,
            0
        );
        
        if ((cell === LIVE && liveNeighbors >= MIN_LIVE_NEIGHBORS && liveNeighbors <= MAX_LIVE_NEIGHBORS) ||
            (cell === DEAD && liveNeighbors === REPRODUCTION_THRESHOLD)) {
            return LIVE;
        } else {
            return DEAD;
        }
    };

    const reducer = (state, action) => {
        if (typeof state === 'undefined') {
            return {
                cells: makeCells(columns, rows),
                running: false,
                steps: 0,
                rows,
                columns,
                cellSize,
            };
        };

        let { cells, running, steps } = state;
        
        switch (action.type) {
            case TOGGLE_RUNNING:
                return {
                    ...state,
                    running: !running
                };
            
            case TOGGLE_CELL:
                if (running) return state;

                return {
                    ...state,
                    cells: cells.map((cell, ix) => ix === action.index ? (cell === LIVE ? DEAD : LIVE) : cell)
                }
            
            case CLEAR:
                if (running) return state;

                return {
                    ...state,
                    steps: 0,
                    cells: makeCells(state.columns, state.rows)
                };
            
            case RANDOM:
                if (running) return state;

                return {
                    ...state,
                    steps: 0,
                    cells: makeCells(state.columns, state.rows, action.threshold)
                };

            case SET_CELL_SIZE:
                if (action.cellSize <= 0) return state;

                return {
                    ...state,
                    cellSize: action.cellSize,
                };

            case RESIZE:
                if (running) return state;

                if (state.rows === action.rows && state.columns === action.columsn) return state;

                return {
                    ...state,
                    cells: makeCells(action.columns, action.rows),
                    steps: 0,
                    rows: action.rows,
                    columns: action.columns
                }
            
            case EVOLVE:
                if (!running) {
                    return state;
                }

                const totalcells = state.cells.length;
                const newGenCells = new Array(totalcells);

                for (let i = 0; i < totalcells; i++) {
                    //let cell = cells[i];
                    let leftmost = i % state.columns === 0;
                    let topmost = i < state.columns;
                    let rightmost = (i + 1) % state.columns === 0;
                    let bottom = i + state.columns > totalcells;
            
                    /*
                    * +----+----+----+
                    * | NW | N  | NE |
                    * +----+----+----+
                    * | W  | x  | E  |
                    * +----+----+----+
                    * | SW | S  | SE |
                    * +----+----+----+
                    */
                    const neighbors = [
                        // NW, undefined if it's a cell in leftmost column, or in topmost row
                        leftmost || topmost ? undefined : cells[i - state.columns - 1],
                        // N_, undefined if it's a cell in topmost row
                        topmost ? undefined : cells[i - state.columns],
                        // NE, undefined if it's a cell in rightmost column, or in topmost row
                        rightmost || topmost ? undefined : cells[i - state.columns + 1],
                        // W_, undefined if it's a cell in leftmost column
                        leftmost ? undefined : cells[i - 1],
                        // E_, undefined if it's a cell in rightmost column
                        rightmost ? undefined : cells[i + 1],
                        // SW, undefined if it's a cell in leftmost column, or in bottom row
                        leftmost || bottom ? undefined : cells[i + state.columns - 1],
                        // S_, undefined if it's a cell in bottom row
                        bottom ? undefined : cells[i + state.columns],
                        // SE, undefined if it's a cell in rightmost column, or in bottom row
                        rightmost || bottom ? undefined : cells[i + state.columns + 1]
                    ];

                    newGenCells[i] = nextGenMapper(cells[i], neighbors);
                }

                let newRunning = running;

                if (running && generationsEquals(cells, newGenCells)) {
                    newRunning = false;
                    console.log('No difference between generations. Halting!')
                }

                return {
                    ...state,
                    running: newRunning,
                    cells: newGenCells,
                    steps: steps + 1
                };
            default:
                return state;
        }
    };

    return createTimedFunction('REDUCER', reducer);
};

