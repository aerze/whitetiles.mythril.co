/*globals Phaser*/

Phaser.Plugin.ButtonPlugin = function (game, parent) {
    Phaser.Plugin.call(this, game, parent);

    game.add.button = function (x, y, text, size, group) {

        if (group === undefined) { group = this.world; }

        return group.add(new Phaser.Plugin.ButtonPlugin.Button(this.game, x, y, text, size));

    };
};

Phaser.Plugin.ButtonPlugin.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.ButtonPlugin.prototype.constructor = Phaser.Plugin.ButtonPlugin;

Phaser.Plugin.ButtonPlugin.Button = function (game, x, y, text, size) {


    x = x || 0;
    y = y || 0;

    text = text || 'test';
    size = size || 32;
    var align = 'left';

    Phaser.Group.call(this, game, null, 'Button_' + text);

    // setup custom events
    this.customEvents = {
        animComplete: new Phaser.Signal(),
        customDown: new Phaser.Signal(),
        customUp: new Phaser.Signal()
    };

    // Create Bitmap Object
    this.bitmapText = this.game.add.bitmapText(x, y -6, 'coolvetica', text, size);
    this.bitmapText.anchor.setTo(0.5, 0.5);

    // Create button Image Object
    this.image = this.game.add.image(x, y, 'blueButton', 0);
    this.image.anchor.setTo(0.5, 0.5);
    this.image.inputEnabled = true;

    // Tie input up and down to the custom group events
    this.image.events.onInputDown.add(function (image) {
        this.bitmapText.y += 10;
        this.image.frame = 1;
        this.customEvents.customDown.dispatch(this);
    }, this);

    this.image.events.onInputUp.add(function (image) {
        this.bitmapText.y -= 10;
        this.image.frame = 0;
        this.customEvents.customUp.dispatch(this);
    }, this);

    this.customEvents.customUp.add(function (group) {
        var tween = this.game.add.tween(group)
        tween.to({ y: -100 }, 400, Phaser.Easing.Quadratic.Out, true);
        tween.onComplete.add(function (group) {
            this.customEvents.animComplete.dispatch();
            this.game.add.tween(this).to({y:0}, 100, Phaser.Easing.Quadratic.In, true);
        }, this);
    }, this);

    // Add both game object to button group
    this.add(this.image);
    this.add(this.bitmapText);

    if (text === '<' || text === '>') this.image.width *= .25;
    if (text === 'Back') this.image.width *= .5;

    this.alpha = 0;

    this.game.add.tween(this).to( { alpha:1 }, 50, Phaser.Easing.Quadratic.In, true, 200);
};

// Extends Phaser.Image
Phaser.Plugin.ButtonPlugin.Button.prototype = Object.create(Phaser.Group.prototype);
Phaser.Plugin.ButtonPlugin.Button.prototype.constructor = Phaser.Plugin.ButtonPlugin.Button;
