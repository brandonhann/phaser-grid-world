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
        this.minimapZoom = 0.3;
    }

    create() {
        const mapScene = this.scene.get('Map') as Map;
        this.mainCamera = mapScene.cameras.main;

        this.gridGraphics = this.add.graphics({ lineStyle: { width: 1, color: 0xFFFFFF } });
        this.gridGraphics.setScrollFactor(0);
        this.viewportGraphics = this.add.graphics({ lineStyle: { width: 2, color: 0xFF0000 } });
        this.viewportGraphics.setScrollFactor(0);
        this.borderGraphics = this.add.graphics({ lineStyle: { width: 2, color: 0x000000 } });
        this.borderGraphics.setScrollFactor(0);
    }

    update() {
        const minimapOffsetX = 10;
        const minimapOffsetY = 10;

        // Set the position of the minimap to a fixed point on the screen
        const offsetX = minimapOffsetX;
        const offsetY = this.game.scale.height - minimapOffsetY - this.minimapSize;

        if (this.mainCamera) {
            const mapScene = this.scene.get('Map') as Map;
            const gridData = mapScene.getGridData();

            if (gridData.showGrid) {
                this.gridGraphics?.clear();
                this.borderGraphics?.clear();

                const centerX = Math.floor((this.mainCamera.scrollX + this.mainCamera.width / 2) / gridData.gridSize);
                const centerY = Math.floor((this.mainCamera.scrollY + this.mainCamera.height / 2) / gridData.gridSize);
                const visibleTiles = Math.ceil(Math.max(this.game.scale.width, this.game.scale.height) / gridData.gridSize / this.minimapZoom);

                const scale = this.minimapSize / Math.max(gridData.gridSize * visibleTiles);

                for (let y = 0; y < visibleTiles; y++) {
                    for (let x = 0; x < visibleTiles; x++) {
                        let tileType = gridData.getTileType(centerX + x - visibleTiles / 2, centerY + y - visibleTiles / 2);
                        let color = tileType === 0 ? 0x0000FF : 0x00FF00;

                        const gridX = offsetX + x * gridData.gridSize * scale;
                        const gridY = offsetY + y * gridData.gridSize * scale;
                        const gridSize = gridData.gridSize * scale;

                        this.gridGraphics?.fillStyle(color).fillRect(gridX, gridY, gridSize, gridSize);
                    }
                }

                this.viewportGraphics?.clear();

                const viewportWidth = this.mainCamera.width / this.mainCamera.zoom * scale;
                const viewportHeight = this.mainCamera.height / this.mainCamera.zoom * scale;

                // Keep viewport centered in the minimap
                const viewportX = offsetX + (this.minimapSize - viewportWidth) / 2;
                const viewportY = offsetY + (this.minimapSize - viewportHeight) / 2;

                this.viewportGraphics?.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);

                this.borderGraphics?.strokeRect(minimapOffsetX, offsetY, this.minimapSize, this.minimapSize);
            }
        }
    }



}