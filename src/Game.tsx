import React, { useEffect } from 'react';
import Phaser from 'phaser';
import { Map } from './Map';

const Game = () => {
    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: 'phaser-game',
            scene: [Map]
        };

        const game = new Phaser.Game(config);

        const resizeGame = () => {
            game.scale.resize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', resizeGame);

        return () => window.removeEventListener('resize', resizeGame);
    }, []);

    return <div id="phaser-game" />;
};

export default Game;