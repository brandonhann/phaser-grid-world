import Phaser from 'phaser';
import { createNoise2D } from 'simplex-noise';
import seedrandom from 'seedrandom';

export class Map extends Phaser.Scene {
    private showGrid: boolean;
    private gridSize: number;
    private minZoom: number;
    private maxZoom: number;
    private defaultZoom: number;
    private gridGraphics?: Phaser.GameObjects.Graphics;
    private controls?: Phaser.Cameras.Controls.FixedKeyControl;
    private highlightGraphics?: Phaser.GameObjects.Graphics;
    private clickedX: number;
    private clickedY: number;
    private isClicked: boolean;
    private noiseMap: Record<string, number> = {};
    private seed: number;
    private simplex: (x: number, y: number) => number;

    constructor() {
        super({ key: 'Map' });
        this.showGrid = true;
        this.gridSize = 64;
        this.minZoom = 1;
        this.maxZoom = 2;
        this.defaultZoom = 1.5;
        this.clickedX = 0;
        this.clickedY = 0;
        this.isClicked = false;
        this.noiseMap = {};

        let storedSeed = localStorage.getItem('ooga');
        if (storedSeed === null) {
            storedSeed = Math.random().toString();
            localStorage.setItem('ooga', storedSeed);
        }
        this.seed = parseFloat(storedSeed);
        let rng = seedrandom(storedSeed);
        Math.random = rng;
        this.simplex = createNoise2D();
    }

    private getNoise(x: number, y: number): number {
        const normalizedX = x / 100;
        const normalizedY = y / 100;
        let key = `${x},${y}`;

        if (this.noiseMap[key] === undefined) {
            const noise = (this.simplex(normalizedX, normalizedY) + 1) / 2;

            const maxDist = Math.sqrt(500 * 500 + 500 * 500);
            const dist = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
            const gradient = 1 - Math.pow(dist / maxDist, 1.2);

            const noiseWithGradient = noise * gradient;

            this.noiseMap[key] = noiseWithGradient;
        }

        return this.noiseMap[key];
    }

    private getTileType(x: number, y: number): number {
        let noiseValue = this.getNoise(x, y);
        let tileType = noiseValue < 0.5 ? 0 : 1; // 0 = water, 1 = land

        if (tileType === 0) {
            let surroundingTiles = [
                this.getNoise(x - 1, y),
                this.getNoise(x + 1, y),
                this.getNoise(x, y - 1),
                this.getNoise(x, y + 1)
            ];
            if (surroundingTiles.every(val => val >= 0.3)) {
                tileType = 1;
            }
        }

        return tileType;
    }

    create() {
        this.gridGraphics = this.add.graphics({ lineStyle: { width: 1, color: 0xFFFFFF } });
        this.highlightGraphics = this.add.graphics({ fillStyle: { color: 0xFFFFFF } });

        for (let y = -500; y < 500; y++) {
            for (let x = -500; x < 500; x++) {
                let key = `${x},${y}`;
                this.noiseMap[key] = this.getNoise(x, y);
            }
        }

        let camera = this.cameras.main;
        camera.setBounds(-Infinity, -Infinity, Infinity, Infinity);
        camera.scrollX = -camera.width / 2;
        camera.scrollY = -camera.height / 2;

        const cursors = this.input.keyboard?.createCursorKeys();
        const controlConfig = {
            camera: camera,
            left: cursors?.left,
            right: cursors?.right,
            up: cursors?.up,
            down: cursors?.down,
            speed: 0.5,
        };
        this.controls = new Phaser.Cameras.Controls.FixedKeyControl(controlConfig);

        let dragging = false;
        let startPoint = new Phaser.Math.Vector2();
        let endPoint = new Phaser.Math.Vector2();

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.button === 2) {
                dragging = true;
                startPoint.set(pointer.x, pointer.y);
            } else if (pointer.button === 0) {
                let worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
                let zoomedGridSize = this.gridSize * this.cameras.main.zoom;
                this.clickedX = Math.floor(worldPoint.x / zoomedGridSize);
                this.clickedY = Math.floor(worldPoint.y / zoomedGridSize);

                this.highlightGraphics?.clear();
                this.highlightGraphics?.fillRect(this.clickedX * zoomedGridSize, this.clickedY * zoomedGridSize, zoomedGridSize, zoomedGridSize);

                console.log(`Clicked on grid: (${this.clickedX}, ${this.clickedY})`);
                this.isClicked = true;
            } else {
                return;
            }
        }, this);


        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (pointer.button === 2) {
                dragging = false;
            }
        }, this);

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (dragging && pointer.button === 2) {
                endPoint.set(pointer.x, pointer.y);
                let diff = startPoint.subtract(endPoint);
                camera.scrollX += diff.x;
                camera.scrollY += diff.y;
                startPoint.set(pointer.x, pointer.y);

                const centerX = camera.scrollX + camera.width / 2;
                const centerY = camera.scrollY + camera.height / 2;

                console.log(`Camera center: (${centerX}, ${centerY})`);
            }
        }, this);

        camera.zoom = this.defaultZoom;

        this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number, deltaZ: number) => {
            const oldZoom = camera.zoom;
            const newZoom = Phaser.Math.Clamp(oldZoom - deltaY * 0.001, this.minZoom, this.maxZoom);

            const centerX = (camera.scrollX + camera.width / 2) / oldZoom;
            const centerY = (camera.scrollY + camera.height / 2) / oldZoom;

            camera.setZoom(newZoom);

            camera.scrollX = centerX * newZoom - camera.width / 2;
            camera.scrollY = centerY * newZoom - camera.height / 2;

            this.update(0, 0);
            this.scene.launch('MinimapScene');
        });


    }

    update(time: number, delta: number) {
        this.controls?.update(delta);
        this.gridGraphics?.clear();

        if (this.showGrid) {
            const cam = this.cameras.main;
            const zoomedGridSize = this.gridSize * cam.zoom;
            const topLeftGridX = Math.floor((cam.scrollX - cam.width * (cam.zoom - 1)) / zoomedGridSize);
            const topLeftGridY = Math.floor((cam.scrollY - cam.height * (cam.zoom - 1)) / zoomedGridSize);
            const bottomRightGridX = Math.ceil((cam.scrollX + cam.width * cam.zoom) / zoomedGridSize);
            const bottomRightGridY = Math.ceil((cam.scrollY + cam.height * cam.zoom) / zoomedGridSize);

            for (let gridY = topLeftGridY; gridY < bottomRightGridY; gridY++) {
                for (let gridX = topLeftGridX; gridX < bottomRightGridX; gridX++) {
                    let tileType = this.getTileType(gridX, gridY);
                    let color = tileType === 0 ? 0x0000FF : 0x00FF00;
                    this.gridGraphics?.fillStyle(color).fillRect(gridX * zoomedGridSize, gridY * zoomedGridSize, zoomedGridSize, zoomedGridSize);
                }
            }
        }

        if (this.isClicked) {
            this.highlightGraphics?.clear();
            let zoomedGridSize = this.gridSize * this.cameras.main.zoom;
            this.highlightGraphics?.fillRect(this.clickedX * zoomedGridSize, this.clickedY * zoomedGridSize, zoomedGridSize, zoomedGridSize);
        }
    }

    getGridData() {
        return {
            showGrid: this.showGrid,
            gridSize: this.gridSize,
            noiseMap: this.noiseMap,
            getTileType: this.getTileType.bind(this),
        };
    }

    toggleGrid() {
        this.showGrid = !this.showGrid;
    }
}