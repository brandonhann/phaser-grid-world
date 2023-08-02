import React, { useEffect } from 'react';
import Phaser from 'phaser';
import { Map } from './Map';
import { MinimapScene } from './MinimapScene';

const Game = () => {
    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: 'phaser-game',
            scene: [Map, MinimapScene]
        };

        const game = new Phaser.Game(config);

        const resizeGame = () => {
            game.scale.resize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', resizeGame);

        const preventContextMenu = (event: MouseEvent) => {
            event.preventDefault();
        };

        window.addEventListener('contextmenu', preventContextMenu);

        return () => {
            window.removeEventListener('resize', resizeGame);
            window.removeEventListener('contextmenu', preventContextMenu);
        };
    }, []);

    return <div id="phaser-game" />;
};

export default Game;