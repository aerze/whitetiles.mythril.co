window.onload = function () {
  var game = new Phaser.Game(
    740, 1200, Phaser.CANVAS, 'gameContainer');
  window.game = game; // TODO Remove in production

  game.state.add('boot', BootState);
  game.state.add('preload', PreloadState);
  game.state.add('menu', MenuState);
  game.state.add('whitetile', GameState);

  game.state.start('boot');
};

var BootState = {
  init: function init () {
    var body = document.querySelector('body');
    var container = document.querySelector('#gameContainer');

    // Only change if we need multiTouch
    this.input.maxPointers = 1;

    // Force Phone-like dimensions
    if (this.game.device.desktop) {
        body.style.width = '400px';
        body.style.margin = '10px auto';
    } else {
        container.style.height = window.innerHeight + 'px';
        container.style.width = window.innerWidth + 'px';
    }

    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    this.game.Button = this.game.plugins.add(Phaser.Plugin.ButtonPlugin);
  },

  preload: function preload () {
      this.load.image('preloaderBar', 'assets/preloader-bar.png');
  },

  create: function create () {
    this.state.start('preload');
  }
};

var PreloadState = {
  preload: function preload () {
    var halfWidth = this.game.width / 2;

    this.stage.backgroundColor = '#b1d256';

    // Create preload sprite
    this.preloadBar = this.add.sprite(halfWidth - 100, this.game.height / 2, 'preloaderBar');
    // Add loading message
    this.add.text(halfWidth, this.game.height / 2 - 30, "Loading...", { font: "32px monospace", fill: "#fff" })
      .anchor.setTo(0.5, 0.5);

    // crops preload sprite
    this.load.setPreloadSprite(this.preloadBar);

    // Bitmap Fonts
    this.load.bitmapFont('coolvetica', 'assets/fonts/coolvetica_regular_32_0.png', 'assets/fonts/coolvetica_regular_32.xml');

    // Load the rest of the assets
    this.load.image('logo', 'assets/logo.png');
    this.load.spritesheet('blueButton', 'assets/blue_button_123.png', 580, 123);
  },

  create: function create () {
    this.preloadBar.cropEnabled = false;
  },

  update: function update () {
    this.state.start('menu');
  }
};

var MenuState = {
  preload: function preload () {
      this.stage.backgroundColor = '#b1d256';
  },

  create: function create () {
    var halfWidth = this.game.width/ 2,
        halfHeight = this.game.height/ 2;
    this.mainGroup = this.add.group();
    this.logo = this.add.sprite(halfWidth, 300, 'logo');
    this.logo.anchor.setTo(0.5, 0.5);
    this.mainGroup.add(this.logo, true);

    // Use custom button plugin to generate a button
    this.button_Easy = this.add.button(halfWidth, halfHeight + 50, 'Easy Peasy', 64, this.mainGroup);
    this.button_Med = this.add.button(halfWidth, halfHeight + 50 + (128), 'Normal', 64, this.mainGroup);
    this.button_Hard = this.add.button(halfWidth, halfHeight + 50 + (128 * 2), 'HARDMODE GOOOOOO!', 64, this.mainGroup);

    // When the animation completes, start game
    this.button_Easy.customEvents.animComplete.add(function () {
        this.state.start('whitetile', true, false, 'easy');
    }, this);
    this.button_Med.customEvents.animComplete.add(function () {
        this.state.start('whitetile', true, false, 'med');
    }, this);
    this.button_Hard.customEvents.animComplete.add(function () {
        this.state.start('whitetile', true, false, 'hard');
    }, this);

    // Slide the button in
    this.game.add.tween(this.button_Easy)
      .from( { y: -200,  }, 900, Phaser.Easing.Elastic.Out, true);
    this.game.add.tween(this.button_Med)
      .from( { y: -200,  }, 1050, Phaser.Easing.Elastic.Out, true);
    this.game.add.tween(this.button_Hard)
      .from( { y: -200,  }, 1250, Phaser.Easing.Elastic.Out, true);
    this.game.add.tween(this.logo)
      .from( { y: -200,  }, 900, Phaser.Easing.Elastic.Out, true);
  }
};

var GameState = {
  DIFFICULTY: {
    easy: {
      rows: 25,
      speed: 4,
      pushTime: 100
    },
    med: {
      rows: 100,
      speed: 6,
      pushTime: 80
    },
    hard: {
      rows: 200,
      speed: 10,
      pushTime: 40
    }
  },

  init: function init (difficulty) {
    this.difficultyKey = difficulty || 'med';
    this.difficulty = this.DIFFICULTY[this.difficultyKey]
  },

  create: function create () {
    this.inPlay = true;

    this.rows = this.difficulty.rows;
    this.boardSpeed = this.difficulty.speed;
    this.cols = 4;
    this.rowsInView = 4;


    // set tile dimensions
    this.tileWidth = this.world.width / 4;
    this.tileHeight = this.world.height / this.rowsInView;

    this.tileGroupHeight = this.rows * this.tileHeight;

    // initialize score
    this.tilesClicked = 0;

    // init with all the rows;
    this.nextTileCounter = this.rows +1

    // generate a new level
    this.generateTiles(this.cols, this.rows);

    // activate input on tiles
    // this.activateTiles();

    // prep end screen
    this.setupEnd();
  },

  generateTiles: function generateTiles (cols, rows) {
    var rowsOffset = this.rowsInView - this.rows;
    var textures = this.createTileTextures(this.tileWidth, this.tileHeight);
    var colCounter = cols;
    var rowCounter = rows;
    var blackTile = false;
    var rand;
    var tile;

    // create a new display object group
    this.tiles = this.add.group();
    this.tiles.name = 'Tiles';
    // start out further up by 1 tile
    this.tiles.y -= this.tileHeight;

    for (rowCounter = rows; rowCounter > 0; rowCounter--) {
      rand = this.rnd.between(1, 4);

      for (colCounter = cols; colCounter > 0; colCounter--) {
        blackTile = rand === colCounter;
        tile = this.tiles.create(
          this.tileWidth * (colCounter -1),
          this.tileHeight* (rowCounter -1 + rowsOffset),
          blackTile ? textures.black: textures.white
        );

        tile.color = blackTile ? 'black': 'white';
        tile.id = blackTile ? rowCounter : undefined;
        tile.row = rowCounter;
        tile.inputEnabled = false;
        tile.events.onInputUp.add(function TileClickHandler(target) {
          if (target.color === 'white') return this.gameOver('whiteTile');
          if (target.id === this.nextTileCounter) return this.gameOver('wrongOrder');
          return this.pushBoard(); // good click, push board
        }, this);
      }
    }
  },

  createTileTextures: function createTileTextures(tileWidth, tileHeight) {
    var graphic = this.make.graphics(0, 0);
    var whiteTexture;
    var blackTexture;

    graphic.lineStyle(3, 0x000000, 1);
    graphic.beginFill(0xFFFFFF, 1);
    graphic.drawRect(0, 0, tileWidth, tileHeight);
    graphic.endFill();
    whiteTexture = graphic.generateTexture();

    graphic.beginFill(0x000000, 1);
    graphic.drawRect(0, 0, tileWidth, tileHeight);
    graphic.endFill();
    blackTexture = graphic.generateTexture();

    return {
      white: whiteTexture,
      black: blackTexture
    };
  },

  deactivateTiles: function deactivateTiles () {
    var disableInput = function (child) {
      child.inputEnabled = false;
    };

    this.tiles.forEach(disableInput, this);
  },

  setupEnd: function setupEnd () {
    var width = this.world.width,
      height = this.world.height,
      halfWidth = width/ 2,
      halfHeight = height/ 2;

    var graphic = this.make.graphics();
    graphic.lineStyle(0, 0x000000, 0);
    graphic.beginFill(0x000000, 0.8);
    graphic.drawRect(0, 0, width * 3, height * 3);
    graphic.endFill();
    var fullscreenCover = graphic.generateTexture();

    this.endScreen = this.add.group();
    this.endScreen.name = 'endScreen';
    this.endScreen.visible = false;

    this.endScreen.create(-width, -height, fullscreenCover);

    this.endScreenText = this.add.text(halfWidth, halfHeight - 250, '', { font: '100px Arial', fill: '#fff' }, this.endScreen);
    this.endScreenText.anchor.setTo(0.5, 0.5);

    this.endScreenScore = this.add.text(halfWidth, halfHeight, '', { font: '80px Arial', fill: '#fff' }, this.endScreen);
    this.endScreenScore.anchor.setTo(0.5, 0.5);

    this.button_Reset = this.add.button(halfWidth, halfHeight + 50 + (128 * 2), 'Retry?', 64, this.endScreen);
    this.button_Reset.customEvents.animComplete.add(function () { this.state.restart(true, false, this.difficultyKey); }, this);
    this.game.add.tween(this.button_Reset).from({ y: -200,  }, 800, Phaser.Easing.Elastic.Out, true);


    this.button_Back = this.add.button(halfWidth, this.game.height - 100, 'Back', 48, this.endScreen);
    this.button_Back.customEvents.animComplete.add(function () { this.state.start('menu'); }, this);
    this.game.add.tween(this.button_Back).from({ y: -200,  }, 800, Phaser.Easing.Elastic.Out, true);
  },

  gameOver: function gameOver (reason) {
    // stop gameplay
    this.boardSpeed = 0;
    this.inPlay = false;
    this.deactivateTiles();

    this.endScreenText.text = this.REASONS[reason];
    this.endScreenScore.text = 'Score: ' + this.tilesClicked;

    // slide in end screen
    var yTween = this.game.add
      .tween(this.endScreen)
      .from({ y: -500 }, 900, Phaser.Easing.Elastic.Out);
    var alphaTween = this.game.add
      .tween(this.endScreen)
      .from({ alpha: 0 }, 400, Phaser.Easing.Quartic.Out);

    yTween.start();
    alphaTween.start();
    this.endScreen.visible = true;
  },

  REASONS: {
    'whiteTile': 'Don\'t step on\nthe white tile!',
    'wrongOrder': ' Missed A Step! ',
    'missedTile': 'Too Late!',
    'winner': 'You Won!'
  },

  update: function update () {
    if (!this.inPlay) return;
    if (this.nextRow !== this.tilesClicked+1) {
      // which row needs to be hit next
      this.nextRow = this.tilesClicked +1;
      // y value of 1 tile from the bottom
      this.dangerZoneTop = this.nextRow * this.tileHeight;
    }

    // moving y values of the tile group's edges
    this.nextRowBottom = this.tiles.y + this.tileHeight;
    this.nextRowTop = this.tiles.y;
    this.tilesTop = this.tiles.y - this.tileGroupHeight;

    // var botRow = this.nextTileCounter +1;
    // var topRow = this.nextTileCounter -5;
    var tempTile;
    this.tiles.forEach(function checkVis(tile) {
      // console.log(tile.row, this.nextTileCounter +1,  tile.row,  this.nextTileCounter + 2);
      // var tileRow = tile.row;
      // if (tileRow > botRow +1) return;
      // if (tileRow < topRow -1) return;
      tempTile = tile;
      if (tile.row <= this.nextTileCounter +1 && tile.row > this.nextTileCounter - 6) {
        tempTile.renderable = true;
        tempTile.inputEnabled = true;
      } else {
        tempTile.renderable = false;
        tempTile.inputEnabled = false
      }
    }, this);

    // if last tile is past the bottom, let the player catch up
    this.pushForce = (this.nextRowBottom >= this.dangerZoneTop)? 0.5: 1;

    // top of last tile is past the bottom, you lose
    if (this.nextRowTop > this.dangerZoneTop) return this.gameOver('missedTile');

    // if top has reach bottom, and you clicked once each row
    if (this.tilesTop === 0 && this.tilesClicked === this.rows) return this.gameOver('winner');

    return this.moveBoard();
  },

  pushBoard: function pushBoard () {
    this.nextTileCounter -= 1;
    this.tilesClicked += 1;
    this.tiles.y += this.tileHeight * this.pushForce /2;
    // this.tilesTween = this.add.tween(this.tiles)
    //   .to({y: this.tiles.y + this.tileHeight * this.pushForce}, this.difficulty.pushTime, 'Quart.easeInOut')
    //   .start();
  },

  moveBoard: function moveBoard () {
    this.tiles.y += this.boardSpeed;
  }
};
