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
    }

    update(time: number, delta: number) {
        this.controls?.update(delta);

        this.gridGraphics?.clear();

        if (this.showGrid) {
            const cam = this.cameras.main;

            const topLeftX = Math.floor(cam.scrollX / this.gridSize) * this.gridSize;
            const topLeftY = Math.floor(cam.scrollY / this.gridSize) * this.gridSize;

            const bottomRightX = Math.ceil((cam.scrollX + cam.width) / this.gridSize) * this.gridSize;
            const bottomRightY = Math.ceil((cam.scrollY + cam.height) / this.gridSize) * this.gridSize;

            for (let y = topLeftY; y < bottomRightY; y += this.gridSize) {
                for (let x = topLeftX; x < bottomRightX; x += this.gridSize) {
                    this.gridGraphics?.strokeRect(x, y, this.gridSize, this.gridSize);
                }
            }
        }
    }

    toggleGrid() {
        this.showGrid = !this.showGrid;
    }
}