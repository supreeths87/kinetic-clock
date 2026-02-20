class CarClock {
    constructor() {
        this.gridRows = 9;
        this.gridCols = 5;
        this.carWidth = 34;
        this.carHeight = 34;
        this.currentTime = '';

        this.containers = {
            hourTens: document.getElementById('hour-tens'),
            hourOnes: document.getElementById('hour-ones'),
            minTens: document.getElementById('min-tens'),
            minOnes: document.getElementById('min-ones')
        };
        this.ampmDisplay = document.getElementById('ampm');
        this.cars = {
            hourTens: {},
            hourOnes: {},
            minTens: {},
            minOnes: {}
        };

        this.segmentCells = this.defineSegmentCells();
        this.digitSegments = {
            0: ['A', 'B', 'C', 'D', 'E', 'F'],
            1: ['B', 'C'],
            2: ['A', 'B', 'G', 'E', 'D'],
            3: ['A', 'B', 'G', 'C', 'D'],
            4: ['F', 'G', 'B', 'C'],
            5: ['A', 'F', 'G', 'C', 'D'],
            6: ['A', 'F', 'G', 'E', 'C', 'D'],
            7: ['A', 'B', 'C'],
            8: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            9: ['A', 'B', 'C', 'D', 'F', 'G']
        };
        this.digitPatterns = this.buildDigitPatterns();

        this.init();
    }

    init() {
        Object.keys(this.containers).forEach(key => {
            this.createCarsForContainer(key, this.containers[key]);
        });

        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        window.addEventListener('resize', () => this.refreshPositions());
    }

    getTimeString() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        const timeString = String(hours).padStart(2, '0') + String(minutes).padStart(2, '0');

        return {
            time: timeString,
            ampm: ''
        };
    }

    updateClock() {
        const { time, ampm } = this.getTimeString();

        if (time !== this.currentTime) {
            this.currentTime = time;

            this.updateDigitDisplay('hourTens', time[0]);
            this.updateDigitDisplay('hourOnes', time[1]);
            this.updateDigitDisplay('minTens', time[2]);
            this.updateDigitDisplay('minOnes', time[3]);

            if (ampm !== this.ampmDisplay.textContent) {
                this.ampmDisplay.textContent = ampm;
            }
        }
    }

    updateDigitDisplay(containerKey, newDigit) {
        const container = this.containers[containerKey];
        const pattern = this.digitPatterns[newDigit] || [];
        const targetPositions = new Set(pattern.map(pos => pos.join(',')));

        const moveQueue = [];
        for (let row = 0; row < this.gridRows; row++) {
            for (let col = 0; col < this.gridCols; col++) {
                const posKey = `${row},${col}`;
                const carEl = this.cars[containerKey][posKey];
                const positions = this.getPositionsForCell(container, row, col, carEl.dataset.orientation);
                const isTarget = targetPositions.has(posKey);
                moveQueue.push({ row, col, carEl, positions, isTarget });
            }
        }

        const entering = moveQueue.filter(item => item.isTarget);
        const exiting = moveQueue.filter(item => !item.isTarget && !item.carEl.classList.contains('inactive'));
        const enterStepDelay = 65;
        const exitStepDelay = 45;

        entering.forEach((item, index) => {
            const delay = index * enterStepDelay;
            const { carEl, positions } = item;

            if (carEl._hideTimer) {
                clearTimeout(carEl._hideTimer);
                carEl._hideTimer = null;
            }

            carEl.style.transitionDelay = `${delay}ms, ${delay}ms, 0ms`;
            carEl.classList.remove('inactive', 'parking');

            requestAnimationFrame(() => {
                carEl.style.left = positions.cellX + 'px';
                carEl.style.top = positions.cellY + 'px';
            });
        });

        exiting.forEach((item, index) => {
            const delay = index * exitStepDelay;
            const { carEl, positions } = item;

            if (carEl._hideTimer) {
                clearTimeout(carEl._hideTimer);
            }

            carEl.style.transitionDelay = `${delay}ms, ${delay}ms, 0ms`;
            carEl.classList.add('parking');
            carEl.classList.remove('inactive');

            requestAnimationFrame(() => {
                carEl.style.left = positions.parkX + 'px';
                carEl.style.top = positions.parkY + 'px';
            });

            carEl._hideTimer = setTimeout(() => {
                carEl.classList.remove('parking');
                carEl.classList.add('inactive');
                carEl._hideTimer = null;
            }, delay + 1100);
        });
    }

    defineSegmentCells() {
        return {
            A: this.cellsForRows([0], [1, 2, 3]),
            B: this.cellsForRows([1, 2, 3], [4]),
            C: this.cellsForRows([5, 6, 7], [4]),
            D: this.cellsForRows([8], [1, 2, 3]),
            E: this.cellsForRows([5, 6, 7], [0]),
            F: this.cellsForRows([1, 2, 3], [0]),
            G: this.cellsForRows([4], [1, 2, 3])
        };
    }

    buildDigitPatterns() {
        const patterns = {};
        Object.keys(this.digitSegments).forEach(digit => {
            const coords = [];
            this.digitSegments[digit].forEach(segment => {
                coords.push(...this.segmentCells[segment]);
            });

            const unique = Array.from(new Set(coords.map(c => c.join(',')))).map(key => key.split(',').map(Number));
            patterns[digit] = unique;
        });
        return patterns;
    }

    cellsForRows(rowIndexes, colIndexes) {
        const cells = [];
        rowIndexes.forEach(r => {
            colIndexes.forEach(c => {
                cells.push([r, c]);
            });
        });
        return cells;
    }

    createCarsForContainer(containerKey, container) {
        for (let row = 0; row < this.gridRows; row++) {
            for (let col = 0; col < this.gridCols; col++) {
                const posKey = `${row},${col}`;
                const carEl = document.createElement('div');
                carEl.className = 'car-container inactive';
                carEl.dataset.grid = posKey;
                const orientation = this.getCarOrientation(row, col);
                carEl.dataset.orientation = orientation;

                const positions = this.getPositionsForCell(container, row, col, orientation);
                carEl.style.left = positions.parkX + 'px';
                carEl.style.top = positions.parkY + 'px';

                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', '0 0 60 60');
                svg.setAttribute('class', 'car-svg');
                svg.innerHTML = this.getCarSvgMarkup(orientation);

                carEl.appendChild(svg);
                container.appendChild(carEl);
                this.cars[containerKey][posKey] = carEl;
            }
        }
    }

    getCarOrientation(row, col) {
        const horizontalRows = new Set([0, 4, 8]);
        if (horizontalRows.has(row)) {
            return 'horizontal';
        }
        if (col === 0 || col === this.gridCols - 1) {
            return 'vertical';
        }
        return 'horizontal';
    }

    getCarSvgMarkup(orientation) {
        if (orientation === 'vertical') {
            return `
                <defs>
                    <linearGradient id="cabVBody" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#ffd94a"/>
                        <stop offset="100%" stop-color="#e8b91f"/>
                    </linearGradient>
                </defs>
                <ellipse cx="30" cy="53" rx="9" ry="2" fill="#000000" opacity="0.18"/>
                <rect x="18" y="6" width="24" height="48" rx="7" fill="url(#cabVBody)" stroke="#b88912" stroke-width="1.3"/>
                <rect x="20" y="8" width="20" height="44" rx="6" fill="#ffe684" opacity="0.45"/>
                <rect x="22" y="12" width="16" height="10" rx="3" fill="#1e232e"/>
                <rect x="22" y="38" width="16" height="10" rx="3" fill="#1e232e"/>
                <rect x="22" y="24" width="16" height="12" rx="3" fill="#ffe06a"/>
                <rect x="22" y="28" width="16" height="4" fill="#111521"/>
                <rect x="25" y="28" width="2" height="4" fill="#ffe06a"/>
                <rect x="29" y="28" width="2" height="4" fill="#ffe06a"/>
                <rect x="33" y="28" width="2" height="4" fill="#ffe06a"/>
                <rect x="24.5" y="5.3" width="11" height="3.8" rx="1.2" fill="#ffffff" stroke="#c4cbd8" stroke-width="0.8"/>
                <text x="30" y="8.05" text-anchor="middle" font-size="2.8" font-family="Arial" fill="#222">TAXI</text>
                <rect x="16.2" y="13" width="2.8" height="8" rx="1.1" fill="#313744"/>
                <rect x="41" y="13" width="2.8" height="8" rx="1.1" fill="#313744"/>
                <rect x="16.2" y="39" width="2.8" height="8" rx="1.1" fill="#313744"/>
                <rect x="41" y="39" width="2.8" height="8" rx="1.1" fill="#313744"/>
                <rect x="19" y="7" width="2.4" height="46" rx="1.1" fill="#fff3b8" opacity="0.6"/>
                <rect x="38.6" y="7" width="2.4" height="46" rx="1.1" fill="#cc9d1c" opacity="0.55"/>
            `;
        }

        return `
            <defs>
                <linearGradient id="cabHBody" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#ffd94a"/>
                    <stop offset="100%" stop-color="#e8b91f"/>
                </linearGradient>
            </defs>
            <ellipse cx="30" cy="41" rx="14" ry="2" fill="#000000" opacity="0.18"/>
            <rect x="6" y="18" width="48" height="24" rx="7" fill="url(#cabHBody)" stroke="#b88912" stroke-width="1.3"/>
            <rect x="8" y="20" width="44" height="20" rx="6" fill="#ffe684" opacity="0.45"/>
            <rect x="12" y="22" width="10" height="16" rx="3" fill="#1e232e"/>
            <rect x="38" y="22" width="10" height="16" rx="3" fill="#1e232e"/>
            <rect x="24" y="22" width="12" height="16" rx="3" fill="#ffe06a"/>
            <rect x="24" y="28" width="12" height="4" fill="#111521"/>
            <rect x="26" y="28" width="2" height="4" fill="#ffe06a"/>
            <rect x="30" y="28" width="2" height="4" fill="#ffe06a"/>
            <rect x="34" y="28" width="2" height="4" fill="#ffe06a"/>
            <rect x="24.2" y="18.6" width="11.6" height="3.7" rx="1.1" fill="#ffffff" stroke="#c4cbd8" stroke-width="0.8"/>
            <text x="30" y="21.25" text-anchor="middle" font-size="2.8" font-family="Arial" fill="#222">TAXI</text>
            <rect x="12" y="16.2" width="8" height="2.8" rx="1.1" fill="#313744"/>
            <rect x="12" y="41" width="8" height="2.8" rx="1.1" fill="#313744"/>
            <rect x="40" y="16.2" width="8" height="2.8" rx="1.1" fill="#313744"/>
            <rect x="40" y="41" width="8" height="2.8" rx="1.1" fill="#313744"/>
            <rect x="7" y="19" width="46" height="2.4" rx="1.1" fill="#fff3b8" opacity="0.6"/>
            <rect x="7" y="38.6" width="46" height="2.4" rx="1.1" fill="#cc9d1c" opacity="0.55"/>
        `;
    }

    getPositionsForCell(container, row, col, orientation) {
        const cellWidth = container.clientWidth / this.gridCols;
        const cellHeight = container.clientHeight / this.gridRows;
        const cellX = col * cellWidth + (cellWidth - this.carWidth) / 2;
        const cellY = row * cellHeight + (cellHeight - this.carHeight) / 2;

        const horizontalOffset = Math.max(180, Math.round(container.clientWidth * 0.9));
        const verticalOffset = Math.max(180, Math.round(container.clientHeight * 0.7));

        let parkX = cellX;
        let parkY = cellY;

        if (orientation === 'vertical') {
            // Returning cabs enter from bottom and move upward into the vertical stacks.
            parkX = cellX;
            parkY = container.clientHeight + verticalOffset;
        } else {
            // Returning cabs enter from left and move right into horizontal bars.
            parkX = -this.carWidth - horizontalOffset;
            parkY = cellY;
        }

        return { cellX, cellY, parkX, parkY };
    }

    refreshPositions() {
        Object.keys(this.containers).forEach(key => {
            const container = this.containers[key];
            for (let row = 0; row < this.gridRows; row++) {
                for (let col = 0; col < this.gridCols; col++) {
                    const posKey = `${row},${col}`;
                    const carEl = this.cars[key][posKey];
                    if (!carEl) continue;
                    const positions = this.getPositionsForCell(container, row, col, carEl.dataset.orientation);
                    if (carEl.classList.contains('inactive')) {
                        carEl.style.left = positions.parkX + 'px';
                        carEl.style.top = positions.parkY + 'px';
                    } else {
                        carEl.style.left = positions.cellX + 'px';
                        carEl.style.top = positions.cellY + 'px';
                    }
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CarClock();

    const buttons = document.querySelectorAll('.flair-btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.dataset.flair;
            document.body.classList.remove('flair-cinematic', 'flair-neon');
            document.body.classList.add(mode === 'neon' ? 'flair-neon' : 'flair-cinematic');

            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
});
