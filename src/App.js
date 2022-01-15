
import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import ReactGA from 'react-ga';
import { BG_1, BG_2, CELLWIDTH, LIVE_CELL_COLOR } from './constants';
import { toggleRunning, toggleCell, clear, randomize, setCellSize, resize, LIVE } from './automata';
import './App.css';
import { createTimedFunction } from './util';

function Canvas({
    width,
    height,
    draw,
    handleClick,
    ...rest
}) {
    const canvasRef = useRef(null);
    let canvasRect;
    
    const onCanvasClick = ({
        clientX, clientY,
        altKey, ctrlKey, metaKey, shiftKey,
        nativeEvent, target, type,
    }) => {
        return handleClick({
            clientX, clientY,
            altKey, ctrlKey, metaKey, shiftKey,
            nativeEvent, target, type,
            normX: clientX - canvasRect.left,
            normY: clientY - canvasRect.top,
        });
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvasRect = canvas.getBoundingClientRect();

        /*
        // Uncomment this section for animations
        let frameCount = 0;
        let animationFrameId;

        const render = () => {
            frameCount++;
            draw(context, frameCount);
            animationFrameId = window.requestAnimationFrame(render);
        };

        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        }
        */

        // this will not work if animations are involved
        draw(context, 0);
    }, [draw]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onClick={onCanvasClick}
            {...rest}
        />
    );
}

function Board({
    columns,
    rows,
    cells,
    cellSize = CELLWIDTH,
    toggleCell,
}) {
    const coloringFunction = value => value === LIVE ? LIVE_CELL_COLOR : null;

    const draw = (ctx) => {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                const cellColor = coloringFunction(cells[i * columns + j]);

                if (cellColor) {
                    ctx.fillStyle = cellColor;
                    ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                } else {
                    const evenRow = !(i % 2);
                    const evenColumn = !(j % 2);
                    const shade = (evenColumn && evenRow) || (!evenColumn && !evenRow);
                    ctx.fillStyle = shade ? BG_1 : BG_2;
                    ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                }
            }
        }
    };

    const width = columns * cellSize;
    const height = rows * cellSize;

    const handleClick = ({ normX, normY }) => {
        const row = Math.floor(normX / cellSize);
        const col = Math.floor(normY / cellSize);
        toggleCell(col * columns + row);
    }

    return (
        <div className='board' style={{ width, height, }}>
            <Canvas
                className="board-canvas"
                width={width} height={height}
                draw={createTimedFunction('DRAW', draw)}
                handleClick={handleClick}
            />
        </div>
    );
}

function App({
    rows,
    columns,
    cells,
    running,
    steps,
    toggleRunning,
    toggleCell,
    clear,
    randomize,
    cellSize,
    setCellSize,
    resize
}) {
    useEffect(() => {
        ReactGA.initialize('UA-164368554-1');
        ReactGA.pageview('/');        
    });

    return (
        <div id="app">
            <div id="grid">
                <Board {...{ columns, rows, cells, cellSize, toggleCell }} />
            </div>
            <div id="controls">
                <StepsIndicator {...{ steps }} />
                <Buttons {...{ running, toggleRunning, clear}} />
                <Randomizer {...{ running, randomize }} />
                <CellSizer {...{running, cellSize, setCellSize}} />
                <Resizer {...{ columns, rows, running, resize }} />
                <Footer />
            </div>
            <Insructions />
            <ForConway />
        </div>
    );
}

function Buttons({
    running,
    toggleRunning,
    clear
}) {
    let label = running ? 'Pause' : 'Run';

    return (
        <div id="buttons">
            <button id="run" onClick={toggleRunning} title={label}>
                <span role="img" aria-label={label}>{running ? '⏸️' : '▶️'}</span>
            </button>
            <button id="clear" onClick={clear} className={running ? 'disabled-button' : ''} title={'Clear'}>
                <span role="img" aria-label="Clear">🧹</span>
            </button>
        </div>
    );
}

function StepsIndicator({
    steps
}) {
    return (
        <div id="steps-container">
            <label id="steps-lbl" title="Steps">
                <span role="img" aria-label="Steps">🐾</span>
            </label>
            <label id="steps">{steps}</label>
        </div>
    );
}

function Randomizer({
    running,
    randomize
}) {
    const [threshold, setThreshold] = useState(0.9);

    return (
        <div id="randomizer">
            <input id="threshold" type="text" value={threshold} onChange={e => setThreshold(e.target.value)} />
            <button id="random" onClick={() => randomize(threshold)} className={running ? 'disabled-button' : ''} title="Randomize">
                <span role="img" aria-label="Randomize">🔀</span>
            </button>
        </div>
    );
}

function CellSizer({
    cellSize,
    setCellSize,
}) {
    const [size, setSize] = useState(cellSize);

    return (
        <div id="cellsizer">
            <input id="cellsize" type="text" value={size} onChange={e => setSize(e.target.value)} />
            <button id="setcellsize" onClick={() => setCellSize(size)} title="Set Cell Size">
                <span role="img" aria-label="Set Cell Size">⬛</span>
            </button>
        </div>
    );
}

function Resizer({
    columns,
    rows,
    running,
    resize
}) {
    const [resizeToColumns, setResizeToColumns] = useState(columns);
    const [resizeToRows, setResizeToRows] = useState(rows);

    return (
        <div id="resizer">
            <div style={{ width: '100px' }}>
                <span id="columns-lbl" role="img" aria-label="Columns">↔️</span>
                <span id="rows-lbl" role="img" aria-label="Rows">↕️</span>
            </div>
            <div>
                <input id="columns" type="text" value={resizeToColumns} onChange={e => setResizeToColumns(Number(e.target.value))} />
                <input id="rows" type="text" value={resizeToRows} onChange={e => setResizeToRows(Number(e.target.value))} />
            </div>
            <div>
                <button id="resize" onClick={() => resize(resizeToColumns, resizeToRows)} className={running ? 'disabled-button' : ''} title="Resize">
                    <span>Resize</span>
                </button>
            </div>
        </div>
    );
}

function Footer() {
    return (
        <div id="footer" title="Sampath Sitinamaluwa">
            <Board
                columns={3} rows={3}
                cells={[1, 1, 1, 0, 0, 1, 0, 1, 0]}
                toggleCell={() => {}}
            />
        </div>
    );
}

function Insructions() {
    return (
        <div id="instructions">
            <p>
                Click anywhere on the Universe while game is <em>paused</em> to toggle a cell. <br />
                Click <span role="img" aria-label="Randomize Button">🔀</span> while game is <em>paused</em> to sprinkle live cells randomly all over the Universe. <br />
                Change the adjacent textbox containing '0.9' to adjust the probability of a random cell being live.
                Click <span role="img" aria-label="Run Button">▶️</span> or <span role="img" aria-label="Pause Button">⏸️</span> to run or pause the automata. <br />
                Click <span role="img" aria-label="Clear Button">🧹</span> while game is <em>paused</em> to clear all cells in the Universe.
            </p>
        </div>
    );
}

const OBITUARY_URL = 'https://www.princeton.edu/news/2020/04/14/mathematician-john-horton-conway-magical-genius-known-inventing-game-life-dies-age';

function ForConway() {
    return (
        <div id="for-conway">
            In memory of <strong><a id="obituary-link" href={OBITUARY_URL} target="_blank" rel="noopener noreferrer">John Horton Conway</a></strong> (1937-2020)
        </div>
    );
}

export default connect(
    state => ({
        rows: state.rows,
        columns: state.columns,
        cells: state.cells,
        steps: state.steps,
        running: state.running,
        cellSize: state.cellSize,
    }),
    { toggleRunning, toggleCell, clear, randomize, setCellSize, resize }
)(App);
