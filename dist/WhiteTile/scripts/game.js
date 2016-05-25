window.onload = function () {
  var game = new Phaser.Game(
    740, 1200, Phaser.AUTO, 'gameContainer');
  window.game = game; // TODO Remove in production

  game.state.add('boot', BootState);
  game.state.add('preload', PreloadState);
  game.state.add('menu', MenuState);

  game.state.start('boot');
};

var BootState = {
  init: function () {
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

  preload: function () {
      this.load.image('preloaderBar', 'assets/preloader-bar.png');
  },

  create: function () {
    this.state.start('preload');
  }
};

var PreloadState = {
  preload: function () {
    var halfWidth = this.game.width / 2;

    this.stage.backgroundColor = '#b1d256';

    // Create preload sprite
    this.preloadBar = this.add.sprite(halfWidth / 2 - 100, this.game.height / 2, 'preloaderBar');
    // Add loading message
    this.add.text(halfWidth / 2, this.game.height / 2 - 30, "Loading...", { font: "32px monospace", fill: "#fff" })
      .anchor.setTo(0.5, 0.5);

    // crops preload sprite
    this.load.setPreloadSprite(this.preloadBar);

    // Bitmap Fonts
    this.load.bitmapFont('coolvetica', 'assets/fonts/coolvetica_regular_32_0.png', 'assets/fonts/coolvetica_regular_32.xml');

    // Load the rest of the assets
    this.load.image('logo', 'assets/logo.png');
    this.load.spritesheet('blueButton', 'assets/blue_button_123.png', 580, 123);
  },

  create: function () {
    this.preloadBar.cropEnabled = false;
  },

  update: function () {
    this.state.start('menu');
  }
};

var MenuState = {
  preload: function () {
      this.stage.backgroundColor = '#b1d256';
  },

  create: function () {
    var halfWidth = this.game.width/ 2,
        halfHeight = this.game.height/ 2;
    this.mainGroup = this.add.group();
    this.logo = this.add.sprite(halfWidth, 300, 'logo');
    this.logo.anchor.setTo(0.5, 0.5);
    this.mainGroup.add(this.logo, true);

    // Use custom button plugin to generate a button
    this.button_Multiplayer = this.add.button(halfWidth, halfHeight + 50, 'PLAY!', 64, this.mainGroup);

    // When the animation completes, start game
    this.button_Multiplayer.customEvents.animComplete.add(function () {
        this.state.start('whitetile');
    }, this);

    // Slide the button in
    this.game.add.tween(this.button_Multiplayer)
      .from( { y: -200,  }, 800, Phaser.Easing.Elastic.Out, true);
    this.game.add.tween(this.logo)
      .from( { y: -200,  }, 800, Phaser.Easing.Elastic.Out, true);
  }
};