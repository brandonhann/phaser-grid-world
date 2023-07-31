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

        new Phaser.Game(config);
    }, []);

    return <div id="phaser-game" />;
};

export default Game;