export function createTimedFunction(label, fn) {
    let totalTime = 0;
    let totalRuns = 0;

    return (...params) => {
        const start = performance.now();
        const ret = fn(...params);
        const end = performance.now();
        const time = end - start;
        totalTime += time;
        totalRuns += 1;
        console.log(`${label}>> last run: ${time}, average: ${totalTime / totalRuns}`);
        return ret;
    };
}