let data = [];
let chart;
let speed = 100;
let isSorting = false;
let shouldStop = false;
const canvas = document.getElementById("chart");
async function generateArray() {
    const size = document.getElementById("size").value;
    const res = await fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size: parseInt(size) })
    });
    const json = await res.json();
    data = json.array;
    canvas.classList.remove("d-none");
    drawChart(data);

}

function drawChart(arr, highlight = []) {
    const ctx = document.getElementById('chart').getContext('2d');
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: arr.map((_, i) => i),
            datasets: [{
                label: 'Value',
                data: arr,
                backgroundColor: arr.map((_, i) =>
                    highlight.includes(i) ? 'red' : 'rgba(0, 123, 255, 0.6)'
                )
            }]
        },
        options: {
            animation: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function bubbleSort() {
    isSorting = true;
    shouldStop = false;

    for (let i = 0; i < data.length && !shouldStop; i++) {
        for (let j = 0; j < data.length - i - 1 && !shouldStop; j++) {
            drawChart(data, [j, j + 1]);
            if (data[j] > data[j + 1]) {
                [data[j], data[j + 1]] = [data[j + 1], data[j]];
                drawChart(data, [j, j + 1]);
                await sleep(speed);
            }
        }
    }
    isSorting = false;
}

async function insertionSort() {
    isSorting = true;
    shouldStop = false;
    for (let i = 1; i < data.length && !shouldStop; i++) {
        let key = data[i];
        let j = i - 1;
        while (j >= 0 && data[j] > key && !shouldStop) {
            data[j + 1] = data[j];
            j--;
            drawChart(data, [j + 1, i]);
            await sleep(speed);
        }
        data[j + 1] = key;
        drawChart(data, [j + 1]);
        await sleep(speed);
    }
    isSorting = false;
}

async function quickSortHelper(low, high) {
    if(shouldStop) return;
    if (low < high) {
        let pi = await partition(low, high);
        await quickSortHelper(low, pi - 1);
        await quickSortHelper(pi + 1, high);
    }
}

async function partition(low, high) {
    if(shouldStop) return;
    let pivot = data[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
            if(shouldStop) return;
        drawChart(data, [j, high]);
        if (data[j] < pivot) {
            i++;
            [data[i], data[j]] = [data[j], data[i]];
            drawChart(data, [i, j]);
            await sleep(speed);
        }
    }
    [data[i + 1], data[high]] = [data[high], data[i + 1]];
    drawChart(data, [i + 1, high]);
    await sleep(speed);
    return i + 1;
}

async function quickSort() {
    isSorting = true;
    shouldStop = false;
    await quickSortHelper(0, data.length - 1);
    isSorting = false;
}

async function mergeSortHelper(l, r) {
    if(shouldStop) return;
    if (l >= r) return;
    let m = Math.floor((l + r) / 2);
    await mergeSortHelper(l, m);
    await mergeSortHelper(m + 1, r);
    await merge(l, m, r);
}

async function merge(l, m, r) {
    if(shouldStop) return;
    let left = data.slice(l, m + 1);
    let right = data.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;

    while (i < left.length && j < right.length) {
        if(shouldStop) return;
        if (left[i] <= right[j]) {
            data[k++] = left[i++];
        } else {
            data[k++] = right[j++];
        }
        drawChart(data, [k - 1]);
        await sleep(speed);
    }

    while (i < left.length) {
        if(shouldStop) return;
        data[k++] = left[i++];
        drawChart(data, [k - 1]);
        await sleep(speed);
    }

    while (j < right.length) {
        if(shouldStop) return;
        data[k++] = right[j++];
        drawChart(data, [k - 1]);
        await sleep(speed);
    }
}

async function mergeSort() {
    isSorting = true;
    shouldStop = false;
    await mergeSortHelper(0, data.length - 1);
    isSorting = false;
}
function setControlsDisabled(disabled ) {
    document.querySelectorAll("button").forEach(btn => btn.disabled = disabled);
    document.getElementById('stopbtn').disabled = !disabled;
    document.getElementById("algorithm").disabled = disabled;
    document.getElementById("size").disabled = disabled;
    document.getElementById("speed").disabled = disabled;
    document.getElementById("generate").disabled = disabled;
}

async function heapify(n, i) {
    if (shouldStop) return;

    let largest = i;
    let left = 2 * i + 1;
    let right = 2 * i + 2;

    // Compare left child
    if (left < n && data[left] > data[largest]) {
        largest = left;
    }

    // Compare right child
    if (right < n && data[right] > data[largest]) {
        largest = right;
    }

    if (largest !== i) {
        [data[i], data[largest]] = [data[largest], data[i]];
        drawChart(data, [i, largest]);
        await sleep(speed);
        await heapify(n, largest); // recursively heapify affected subtree
    }
}

async function heapSort() {
    isSorting = true;
    shouldStop = false;

    let n = data.length;

    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0 && !shouldStop; i--) {

        await heapify(n, i);
    }

    for (let i = n - 1; i > 0 && !shouldStop; i--) {


        [data[0], data[i]] = [data[i], data[0]];
        drawChart(data, [0, i]);
        await sleep(speed);

        await heapify(i, 0); 
    }

    isSorting = false;
}

async function startSort() {
    setControlsDisabled(true);
    speed = 320 - document.getElementById("speed").value;
    const algo = document.getElementById("algorithm").value;
    if (algo === "bubble") await bubbleSort();
    else if (algo === "insertion") await insertionSort();
    else if (algo === "quick") await quickSort();
    else if (algo === "merge") await mergeSort();
    else if (algo === "heap") await heapSort();
    setControlsDisabled(false);
}
function stopSort() {
    if (isSorting) {
        shouldStop = true;
    }
}

