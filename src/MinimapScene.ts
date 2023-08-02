import { Map } from './Map';

export class MinimapScene extends Phaser.Scene {
    mainCamera: Phaser.Cameras.Scene2D.Camera | null;
    gridGraphics?: Phaser.GameObjects.Graphics;
    viewportGraphics?: Phaser.GameObjects.Graphics;
    borderGraphics?: Phaser.GameObjects.Graphics;
    minimapSize: number;
    minimapZoom: number;

    constructor() {
        super({ key: 'MinimapScene' });
        this.mainCamera = null;
        this.minimapSize = 200;
        this.minimapZoom = 0.2;
    }

    create() {
        const mapScene = this.scene.get('Map') as Map;
        this.mainCamera = mapScene.cameras.main;

        this.gridGraphics = this.add.graphics({ lineStyle: { width: 1, color: 0xFFFFFF } });
        this.gridGraphics.setScrollFactor(0);
        this.viewportGraphics = this.add.graphics({ lineStyle: { width: 2, color: 0xFF0000 } });
        this.viewportGraphics.setScrollFactor(0);
        this.borderGraphics = this.add.graphics({ lineStyle: { width: 2, color: 0xFFFFFF } });
        this.borderGraphics.setScrollFactor(0);
    }

    update() {
        if (this.mainCamera) {
            const mapScene = this.scene.get('Map') as Map;
            const gridData = mapScene.getGridData();

            if (gridData.showGrid) {
                this.gridGraphics?.clear();
                this.borderGraphics?.clear();

                const scale = this.minimapSize / Math.min(this.game.scale.width, this.game.scale.height) * this.minimapZoom;
                const topLeftX = Math.floor(this.mainCamera.scrollX / gridData.gridSize);
                const topLeftY = Math.floor(this.mainCamera.scrollY / gridData.gridSize);
                const visibleTilesX = Math.ceil(this.game.scale.width / gridData.gridSize / this.minimapZoom);
                const visibleTilesY = Math.ceil(this.game.scale.height / gridData.gridSize / this.minimapZoom);

                for (let y = 0; y < visibleTilesY; y++) {
                    for (let x = 0; x < visibleTilesX; x++) {
                        let tileType = gridData.getTileType(topLeftX + x, topLeftY + y);
                        let color = tileType === 0 ? 0x0000FF : 0x00FF00;

                        const gridX = x * gridData.gridSize * scale;
                        const gridY = this.game.scale.height - this.minimapSize + y * gridData.gridSize * scale;
                        const gridSize = gridData.gridSize * scale;

                        this.gridGraphics?.fillStyle(color).fillRect(gridX, gridY, gridSize, gridSize);
                    }
                }

                this.viewportGraphics?.clear();
                const viewportWidth = this.game.scale.width * scale;
                const viewportHeight = this.game.scale.height * scale;
                const viewportY = this.game.scale.height - this.minimapSize;
                this.viewportGraphics?.strokeRect(0, viewportY, viewportWidth, viewportHeight);

                const borderY = this.game.scale.height - this.minimapSize;
                this.borderGraphics?.strokeRect(0, borderY, this.minimapSize, this.minimapSize);
            }
        }
    }
}