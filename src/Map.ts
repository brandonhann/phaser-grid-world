import Phaser from 'phaser';

export class Map extends Phaser.Scene {
    private showGrid: boolean;
    private mapData: boolean[][] = [];
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

    constructor() {
        super({ key: 'Map' });
        this.showGrid = true;
        this.gridSize = 64;
        this.minZoom = 1;
        this.maxZoom = 2;
        this.defaultZoom = 1.5
        this.clickedX = 0;
        this.clickedY = 0;
        this.isClicked = false;
    }

    create() {
        this.gridGraphics = this.add.graphics({ lineStyle: { width: 1, color: 0xFFFFFF } });
        this.highlightGraphics = this.add.graphics({ fillStyle: { color: 0xFFFFFF } });

        let camera = this.cameras.main;
        camera.setBounds(-Infinity, -Infinity, Infinity, Infinity);

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
            }
        }, this);

        camera.zoom = this.defaultZoom;

        this.input.on('wheel',
            (pointer: Phaser.Input.Pointer,
                gameObjects: Phaser.GameObjects.GameObject[],
                deltaX: number, deltaY: number, deltaZ: number) => {

                const newZoom = camera.zoom - deltaY * 0.001;
                camera.zoom = Phaser.Math.Clamp(newZoom, this.minZoom, this.maxZoom);
                this.update(0, 0);
            });
    }

    update(time: number, delta: number) {
        this.controls?.update(delta);

        this.gridGraphics?.clear();

        if (this.showGrid) {
            const cam = this.cameras.main;

            const zoomedGridSize = this.gridSize * cam.zoom;

            const topLeftX = Math.floor((cam.scrollX - cam.width * (cam.zoom - 1)) / zoomedGridSize) * zoomedGridSize;
            const topLeftY = Math.floor((cam.scrollY - cam.height * (cam.zoom - 1)) / zoomedGridSize) * zoomedGridSize;

            const bottomRightX = Math.ceil((cam.scrollX + cam.width * cam.zoom) / zoomedGridSize) * zoomedGridSize;
            const bottomRightY = Math.ceil((cam.scrollY + cam.height * cam.zoom) / zoomedGridSize) * zoomedGridSize;

            for (let y = topLeftY; y < bottomRightY; y += zoomedGridSize) {
                for (let x = topLeftX; x < bottomRightX; x += zoomedGridSize) {
                    this.gridGraphics?.strokeRect(x, y, zoomedGridSize, zoomedGridSize);
                }
            }
        }

        if (this.isClicked) {
            this.highlightGraphics?.clear();
            let zoomedGridSize = this.gridSize * this.cameras.main.zoom;
            this.highlightGraphics?.fillRect(this.clickedX * zoomedGridSize, this.clickedY * zoomedGridSize, zoomedGridSize, zoomedGridSize);
        }
    }

    toggleGrid() {
        this.showGrid = !this.showGrid;
    }
}