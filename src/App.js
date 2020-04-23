
import React, { useState, useEffect } from 'react';
import ReactGA from 'react-ga';
import './App.css';
import { TILING } from './automata';
import { Stage, Layer, Rect } from 'react-konva';
import { CELLWIDTH } from './constants';
import { connect } from 'react-redux';
import { toggleRunning, toggleCell, clear, randomize, resize } from './automata';

function Cell({
    cell,
    ix,
    columns,
    toggleCell
}) {
    let cellColor = '#eeeeee';
    let evenColumn = ix % 2;
    let evenRow = Math.floor(ix / columns) % 2 === 0;

    if ((evenColumn === 0 && evenRow) ||
        (evenColumn !== 0 && !evenRow)) {
        cellColor = '#ffffff';
    }

    return (
        <Rect
            x={(ix % columns) * CELLWIDTH}
            y={Math.floor(ix / columns) * CELLWIDTH}
            width={CELLWIDTH} height={CELLWIDTH}
            fill={TILING.coloringFunction(cell) || cellColor}
            shadowBlur={cell ? 3 : 0}
            onClick={() => toggleCell(ix)}
        />
    );
}

function Board({
    columns,
    rows,
    cells,
    toggleCell
}) {
    return (
        <Stage width={columns * CELLWIDTH} height={rows * CELLWIDTH}>
            <Layer>
                {cells.map((cell, ix) => (<Cell key={ix} {...{ cell, ix, columns, toggleCell }} />))}
            </Layer>
        </Stage>
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
    resize
}) {
    useEffect(() => {
        ReactGA.initialize('UA-164368554-1');
        ReactGA.pageview('/');        
    });

    return (
        <div id="app">
            <div id="grid">
                <Board {...{ columns, rows, cells, toggleCell }} />
            </div>
            <div id="controls">
                <StepsIndicator {...{ steps }} />
                <Buttons {...{ running, toggleRunning, clear}} />
                <Randomizer {...{ running, randomize }} />
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
            <button id="random" onClick={() => randomize(threshold)} className={running ? 'disabled-button' : ''} title="Randomize">
                <span role="img" aria-label="Randomize">🔀</span>
            </button>
            <input id="threshold" type="text" value={threshold} onChange={e => setThreshold(e.target.value)} />
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
        running: state.running
    }),
    { toggleRunning, toggleCell, clear, randomize, resize }
)(App);
