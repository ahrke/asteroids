
kontra.init();
kontra.initKeys();

let sprites = [];

const degreesToRadians = degrees => degrees * Math.PI / 180;

let ship = kontra.Sprite({
  type: 'ship',
  x: 300,
  y: 300,
  width: 6,
  rotation: 0,
  dt: 0,
  render() {
    this.context.save();

    this.context.translate(this.x, this.y);
    this.context.rotate(degreesToRadians(this.rotation));

    this.context.beginPath();
    this.context.moveTo(-3, -5);
    this.context.lineTo(12, 0);
    this.context.lineTo(-3, 5);
    this.context.closePath();
    this.context.stroke();

    this.context.restore();
  },
  update() {
    if(kontra.keyPressed('left')) this.rotation -= 4;
    if(kontra.keyPressed('right')) this.rotation += 4;

    let cos = Math.cos(degreesToRadians(this.rotation));
    let sin = Math.sin(degreesToRadians(this.rotation));

    if(kontra.keyPressed('up')) {
      this.ddx = cos * 0.05;
      this.ddy = sin * 0.05;
    } else {
      this.ddx = this.ddy = 0;
    }

    this.advance();

    const magnitude = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    if (magnitude > 5) {
      this.dx *= 0.95;
      this.dy *= 0.95;
    }

    this.dt += 1/60;

    if(kontra.keyPressed('space') && this.dt > 0.25) {
      this.dt = 0;

      let bullet = kontra.Sprite({
        type: 'bullet',
        x: this.x + cos * 12,
        y: this.y + sin * 12,
        dx: this.dx + cos * 5,
        dy: this.dy + sin * 5,
        ttl: 50,
        width: 2, 
        height: 2,
        color: 'white'
      });

      sprites.push(bullet);
    }
  }
});

sprites.push(ship);

const createAsteroids = (x, y, radius) => {
  let asteroid = kontra.Sprite({
    type: 'asteroid',
    x: x,
    y: y,
    dx: Math.random() * 4 - 2,
    dy: Math.random() * 4 - 2,
    radius: radius,
    render() {
      this.context.strokeStyle = "white";
      this.context.beginPath();
      this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      this.context.stroke();
    }
  });

  sprites.push(asteroid);
};

for(let i = 0; i < 4; i++) {
  createAsteroids(100, 100, 30);
}

let loop = kontra.GameLoop({
  update() {
    let canvas = kontra.getCanvas();
    sprites.map(sprite => {
      sprite.update();
  
      if (sprite.x < 0) sprite.x = canvas.width;
      if (sprite.x > canvas.width) sprite.x = 0;
      if (sprite.y > canvas.height) sprite.y = 0;
      if (sprite.y < 0) sprite.y = canvas.height;
      
      for (let sprite of sprites) {
        if (sprite.type === 'asteroid') {
          for (let spriteInner of sprites) {
            if (spriteInner.type !== 'asteroid') {
              let dx = spriteInner.x - sprite.x;
              let dy = spriteInner.y - sprite.y;
              
              if (Math.sqrt(dx * dx + dy * dy) < sprite.radius + spriteInner.width) {
                sprite.ttl = 0;
                spriteInner.ttl = 0;

                if(!spriteInner.isAlive() && spriteInner.type === 'ship') loop.end();

                if (sprite.radius > 10) {
                  for (let x = 0; x < 3; x++) {
                    createAsteroids(sprite.x, sprite.y, sprite.radius/2.5);
                  }
                }
                
                break;
              }
            }
          }
        }
      }
    });

    sprites = sprites.filter(sprite => sprite.isAlive());
  },
  render() {
    sprites.map(sprite => {
      sprite.render();
    })
  }
})

loop.start();