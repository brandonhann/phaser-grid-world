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
        const minimapOffsetX = 10;
        const minimapOffsetY = 10;

        if (this.mainCamera) {
            const mapScene = this.scene.get('Map') as Map;
            const gridData = mapScene.getGridData();

            if (gridData.showGrid) {
                this.gridGraphics?.clear();
                this.borderGraphics?.clear();

                const scale = this.minimapSize / Math.max(this.game.scale.width, this.game.scale.height) * this.minimapZoom;
                const centerX = Math.floor((this.mainCamera.scrollX + this.mainCamera.width / 2) / gridData.gridSize);
                const centerY = Math.floor((this.mainCamera.scrollY + this.mainCamera.height / 2) / gridData.gridSize);
                const visibleTiles = Math.ceil(Math.max(this.game.scale.width, this.game.scale.height) / gridData.gridSize / this.minimapZoom);
                const offsetX = minimapOffsetX + (this.minimapSize - visibleTiles * gridData.gridSize * scale) / 2;
                const offsetY = this.game.scale.height - minimapOffsetY - this.minimapSize + (this.minimapSize - visibleTiles * gridData.gridSize * scale) / 2;

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
                const viewportWidth = this.game.scale.width * scale;
                const viewportHeight = this.game.scale.height * scale;
                const viewportX = minimapOffsetX + this.minimapSize / 2 - viewportWidth / 2;
                const viewportY = this.game.scale.height - minimapOffsetY - this.minimapSize / 2 - viewportHeight / 2 + (viewportWidth - viewportHeight) / 2 - 6;

                this.viewportGraphics?.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);

                const borderY = this.game.scale.height - minimapOffsetY - this.minimapSize;
                this.borderGraphics?.strokeRect(minimapOffsetX, borderY, this.minimapSize, this.minimapSize);
            }
        }
    }


}