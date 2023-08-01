import Phaser from 'phaser';

export class Map extends Phaser.Scene {
    private showGrid: boolean;
    private mapData: boolean[][] = [];
    private gridSize: number;
    private gridGraphics?: Phaser.GameObjects.Graphics;
    private controls?: Phaser.Cameras.Controls.FixedKeyControl;

    constructor() {
        super({ key: 'MapScene' });
        this.showGrid = true;
        this.gridSize = 32;
    }

    create() {
        this.gridGraphics = this.add.graphics({ lineStyle: { width: 1, color: 0xFFFFFF } });

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
            dragging = true;
            startPoint.set(pointer.x, pointer.y);
        }, this);

        this.input.on('pointerup', () => {
            dragging = false;
        }, this);

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (!dragging) {
                return;
            }

            endPoint.set(pointer.x, pointer.y);
            let diff = startPoint.subtract(endPoint);
            camera.scrollX += diff.x;
            camera.scrollY += diff.y;
            startPoint.set(pointer.x, pointer.y);
        }, this);

        // Set initial zoom level
        camera.zoom = 1.5;

        // Set minimum and maximum zoom levels
        const minZoom = 1;
        const maxZoom = 2;

        // Listen for mouse wheel events
        this.input.on('wheel',
            (pointer: Phaser.Input.Pointer,
                gameObjects: Phaser.GameObjects.GameObject[],
                deltaX: number, deltaY: number, deltaZ: number) => {

                // Adjust zoom level based on wheel movement
                const newZoom = camera.zoom - deltaY * 0.001;  // Note the minus sign here

                // Clamp zoom level within specified range
                camera.zoom = Phaser.Math.Clamp(newZoom, minZoom, maxZoom);

                // Redraw grid with updated zoom level
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
    }

    toggleGrid() {
        this.showGrid = !this.showGrid;
    }
}