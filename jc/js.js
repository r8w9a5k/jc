/*

Created by
      ___         ___ 
  _ _( _ )_ __ __/ _ \
 | '_/ _ \ V  V /\_  /
 |_| \___/\_/\_/  /_/ 
 
 
 Assist by lolo with controls & sprites
 & Martin with arrow drawings & touches

*/


///////////////////////////////////
//////////// UTILITIES ////////////
///////////////////////////////////

// Selector
function id(arg){
  return document.getElementById(arg);
} 

// Short console.log
var log = console.log;

// Dirty error handling
function stoperror(){
  return true;
} //window.onerror = stoperror;


// FPS update
var fps, now;

// Init FPS
const init_fps = () => {
    fps = document.createElement("a");
    fps.style.color = "black";
    fps.style.position = "absolute";
    fps.style.top = 0+"px";
    document.body.appendChild(fps);
    now = Date.now();
};
const update_fps = () => {
    fps.innerHTML = Math.round(1000/(Date.now()-now));
    now = Date.now();
};

///////////////////////////////////////////////
////////////////              /////////////////
///////////////////////////////////////////////


/////////////////////////////////////////////
//////////// COLLISION DETECTION ////////////
/////////////////////////////////////////////

// Classic aabb collision - improved left and top for mor precise collision
function collision(a, b) {
  return a.x < b.x + b.width  && // Right
         a.x + a.width/2 > b.x  && // Left
         a.y < b.y + b.height && // Bottom
         a.y + a.height/2 > b.y;   // Top
}

// Modified aabb collision for more precise touches
function collision2(a, b) {
  return a.x - a.width/2 < b.x + b.width &&
         a.x + a.width/2 > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

// Modified classic aabb collision for LavaBlock object (colCheck is catching it earlier)
function collision3(a, b) {
  return a.x < b.x + b.width  && // Right
         a.x + a.width > b.x  && // Left
         a.y < b.y + b.height + 5 && // Bottom
         a.y + a.height > b.y;   // Top
}



// http://www.somethinghitme.com/2013/04/16/creating-a-canvas-platformer-tutorial-part-tw/

function colCheck(shapeA, shapeB) {
  // Get the vectors to check against
  var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
      vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
      // Add the half widths and half heights of the objects
      hWidths = (shapeA.width / 2) + (shapeB.width / 2),
      hHeights = (shapeA.height / 2) + (shapeB.height / 2),
      colDir = null;
    // If the x and y vector are less than the half width or half height,
    // they we must be inside the object, causing a collision
    
  // figures out on which side we are colliding (top, bottom, left, or right)    
  if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
    var oX = hWidths - Math.abs(vX),
        oY = hHeights - Math.abs(vY);
        if (oX >= oY) {
          if (vY > 0) {
            colDir = "t";
              shapeA.y += oY;
          }
          else {
            colDir = "b";
            shapeA.y -= oY;
          }
        } 
        
        else {
          if (vX > 0) {
            colDir = "l";
            shapeA.x += oX;
          }
          
          else {
            colDir = "r";
            shapeA.x -= oX;
          }
        }
       
  }
    return colDir;
    
} 

///////////////////////////////////////////////
////////////////              /////////////////
///////////////////////////////////////////////


///////////////////////////////////////////////
//////////////// PLAYER CLASS /////////////////
///////////////////////////////////////////////

function Player(x, y, width, height){
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  
  // Speed, velocity, jumping, grounded
  this.speed = 3;
  this.vel = {x: 0, y: 0};
  this.jumping = false;
  this.grounded = false;  
  // Gravity and friction
  this.friction = 0.8;
  this.gravity = 0.3;
  
  
  // Jump method (if not jumping and grounded, you can jump)
  this.jump = function() {
    if(!this.jumping && this.grounded) {
      this.jumping = true;
      this.grounded = false;
      this.vel.y = -this.speed * 2.2;
      //log(this.x +" / "+ this.y);
    }
  };
  
  // Spritesheet animation method - used in onload = init method
  this.Sprite = function() {
	  
    // Hero player spritesheet images
    this.runR = new Image();
    this.runR.src = 'img/01.png';

    this.runL = new Image();
    this.runL.src = 'img/02.png';
	
    this.idleR = new Image();
    this.idleR.src = 'img/01.png';

    this.idleL = new Image();
    this.idleL.src = 'img/02.png';
  
    // Animation stuff, idle is standing, direction for animation direction
    this.direction = "right";
    this.idle = true;

    // Frame for each spritesheet; only in x-axis
    this.anim = {
	  frameRunRightX: 0,
	  frameRunLeftX: 0,
	  frameIdleLeftX: 0,
	  frameIdleRightX: 0
    };
  
    this.drawSprite = function(img, sX, sY, sW, sH, dX, dY, dW, dH) {
      c.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH);
    }
  
  }
  
  // Init Sprite method
  this.Sprite();
  
  // Draw method from Sprite
  this.draw = function() {
  // If direction is right and hero is moving (right_down == true)
         if (this.direction === 'right' && right_down) {this.drawSprite(this.runR, this.width * this.anim.frameRunRightX, 0, this.width, this.height, this.x, this.y, this.width, this.height);}
    else if (this.direction === 'left' && left_down)   {this.drawSprite(this.runL, this.width * this.anim.frameRunLeftX, 0, this.width, this.height, this.x, this.y, this.width, this.height);}
    else if (this.direction === 'left' && this.idle)   {this.drawSprite(this.idleL, this.width * this.anim.frameIdleLeftX, 0, this.width, this.height, this.x, this.y, this.width, this.height);}
    else if (this.direction === 'right' && this.idle)  {this.drawSprite(this.idleR, this.width * this.anim.frameIdleRightX, 0, this.width, this.height, this.x, this.y, this.width, this.height);}
	// Fallback to draw something; also this line deletes image flickering ;)
	else 											   {this.drawSprite(this.idleR, this.width * this.anim.frameIdleRightX, 0, this.width, this.height, this.x, this.y, this.width, this.height);}
  }

  // Update method
  this.update = function() {
    // Draw and animate spritesheet
    this.draw();
	
	////////////////////////////////////
    /////////////
    // PHYSICS //
	/////////////
	
    // Gravity and friction  
    this.vel.x *= this.friction;
    this.vel.y += this.gravity;
    
    // Grounded
    if(this.grounded) {
      this.vel.y = 0;
    }
    // Gravity
    this.y += this.vel.y;
	
    /////////////
    // PHYSICS //
	/////////////  
    ////////////////////////////////////


	
    // Movement
    // If right_down button is pressed, then hero is moving to the right
    // and is not standing (idle)
    if(right_down) {
      this.direction = "right";
      this.idle = false;
      this.x += this.vel.x++;
    }
    if(left_down) {
      this.direction = "left";
      this.idle = false;
      this.x += this.vel.x--;
    }
    // Jump
    if(up_down) {this.jump();}

    // If there's no button pushing then player isn't moving
    if(!right_down && !left_down) {
      this.idle = true;
    }

    
    ////////////////////////////////////////
    // Collisions from somethinghitme.com //
    ////////////////////////////////////////
	
    this.grounded = false;
    for (let l = _blocks.length - 1; l >= 0; l--) {
      let dir = colCheck(this, _blocks[l]);
        if (dir === "l" || dir === "r") {
          this.vel.x = 0;
          this.grounded = false;
          // if this.grounded == true I can use it for ladder ;)
        }else if (dir === "b") {
          this.grounded = true;
          this.jumping = false;

        }else if (dir === "t") {
          this.vel.y *= -0.4;
        } 
    }
    


  };
}

///////////////////////////////////////////////
////////////////              /////////////////
///////////////////////////////////////////////


///////////////////////////////////////////////
///////////////// BLOCK CLASS /////////////////
///////////////////////////////////////////////

function Block(img, x, y, width, height) {
  this.img = img;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  
  // Draw method
  this.draw = function() {
    c.drawImage(this.img, this.x, this.y, this.width, this.height);
  };
    
  this.update = function() {
    this.draw();
  };    
}

///////////////////////////////////////////////
////////////////              /////////////////
///////////////////////////////////////////////


///////////////////////////////////////////////
/////////////// LAVABLOCK CLASS ///////////////
///////////////////////////////////////////////

function LavaBlock(img, x, y, width, height) {
  this.img = img;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  
  // Draw method
  this.draw = function() {
	c.drawImage(this.img, this.x, this.y, this.width, this.height);

    // Collision between hero player and LavaBlock
    if(collision3(this, player)){
      player.x = 75; player.y = (CH+120);
      right_down = left_down = up_down = false;
      log("you died!");
    }
  };
  
// Update method  
  this.update = function(){
    this.draw();
  };    
}


///////////////////////////////////////////////
//////////////// ENEMY CLASS //////////////////
///////////////////////////////////////////////

function Enemy(x, y, width, height, startPosX, endPosX) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  
  this.startPosX = startPosX;
  this.endPosX = endPosX;
  this.speed = 1;
  

  
  
  // Spritesheet animation method - used in onload = init method
  this.Sprite = function() {
	  
    // Hero player spritesheet images
    this.runR = new Image();
    this.runR.src = 'img/cactus.png';

    this.runL = new Image();
    this.runL.src = 'img/cactus.png';
	
    this.idleR = new Image();
    this.idleR.src = 'img/cactus.png';

    this.idleL = new Image();
    this.idleL.src = 'img/cactus.png';
  
    // Animation stuff, idle is standing, direction for animation direction
	this.idle = false; // this enemy is only moving
    this.direction = "right";

    // Frame for each spritesheet; only in x-axis
    this.anim = {
	  frameRunRightX: 0,
	  frameRunLeftX: 0,
	  frameIdleLeftX: 0,
	  frameIdleRightX: 0
    };
  
    this.drawSprite = function(img, sX, sY, sW, sH, dX, dY, dW, dH) {
      c.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH);
    }
  
  }
  
  // Init Sprite method
  this.Sprite();
  
  // Draw method from Sprite
  this.draw = function() {
  // If direction is right and hero is moving (right_down == true)
         if (this.direction === 'right' && !this.idle) {this.drawSprite(this.runR, this.width * this.anim.frameRunRightX, 0, this.width, this.height, this.x, this.y, this.width, this.height);}
    else if (this.direction === 'left' && !this.idle)  {this.drawSprite(this.runL, this.width * this.anim.frameRunLeftX, 0, this.width, this.height, this.x, this.y, this.width, this.height);}
    else if (this.direction === 'left' && this.idle)   {this.drawSprite(this.idleL, this.width * this.anim.frameIdleLeftX, 0, this.width, this.height, this.x, this.y, this.width, this.height);}
    else if (this.direction === 'right' && this.idle)  {this.drawSprite(this.idleR, this.width * this.anim.frameIdleRightX, 0, this.width, this.height, this.x, this.y, this.width, this.height);}
	// Fallback to draw something; also this line deletes image flickering ;)
	else 											   {this.drawSprite(this.runR, this.width * this.anim.frameIdleRightX, 0, this.width, this.height, this.x, this.y, this.width, this.height);}
  }

  // Update method
  this.update = function() {
    // Draw and animate spritesheet
    this.draw();
	
	// Movement
	// If this.x is less than end position, move right 
    if(this.x <= this.endPosX) {this.x += this.speed;}
	// If this.x is on it's start on end position then reverse speed
    if(this.x == this.endPosX || this.x == this.startPosX) {this.speed = -this.speed;}
	// If this.x is greater than end position then go back to start position
    if(this.x >= this.endPosX) {this.x += this.speed;}
	
	// this.speed > 0 aka is moving right else is moving left
	this.speed > 0 ? this.direction = "right" : this.direction = "left";
    
    
    // Collisions between player and enemy object
    if(collision(player, this)) {
      player.x = 75; player.y = (CH+120);
      right_down = left_down = up_down = shoot_down = false;
      log("you died!");
    }
  };   
}

///////////////////////////////////////////////
////////////////              /////////////////
///////////////////////////////////////////////


///////////////////////////////////////////////
//////////////// OBJECT CLASS /////////////////
///////////////////////////////////////////////

function Objects(img, x, y, width, height) {
  this.img = img;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  
  // Draw method - only images for decoration
  this.draw = function() {
	c.drawImage(this.img, this.x, this.y, this.width, this.height);  
  };
    
  this.update = function(){
    this.draw();
  };    
}

///////////////////////////////////////////////
////////////////              /////////////////
///////////////////////////////////////////////


///////////////////////////////////////////////
////////////////// SUN CLASS //////////////////
///////////////////////////////////////////////

function Sun(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.color = "#FBFF00";
  
  // Draw method
  this.draw = function() {
    c.beginPath();
    //c.save()
    c.rect(this.x, this.y, this.width, this.height); 
    //c.lineWidth = 2;
    //c.shadowBlur = 10;
    //c.shadowColor = "white";
    c.fillStyle = this.color;
    c.fill();
    //c.restore();
    c.closePath();
  };
  
  // Update method
  this.update = function() {
    if(collision(player, this)){
      player.x = 70; player.y = (CH + 120 );
      right_down = left_down = up_down = false;
	  log("you won!");
	  
	  // Splice all blocks and draw next level
	  _blocks = [];
	  drawGame(level[1]);
    }
    
    this.draw();
  };
}

///////////////////////////////////////////////
////////////////              /////////////////
///////////////////////////////////////////////


///////////////////////////////////////////////
//////////// 2D ARRAY MAP WORLD ///////////////
///////////////////////////////////////////////

//var cnv = null;
//var ctx = null;
const level = [];
level[0] = [
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,

0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,3,3,3,3,3,3,3,3,1,1,1,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,5,1,1,1,1,3,1,1,1,1,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,0,6,6,6,6,0,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,0,0,0,0,0,0,0,0,3,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,0,0,0,0,0,0,0,0,0,0,3,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,3,3,3,3,3,3,3,3,3,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,3,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,1,1,1,1,1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,3,0,6,6,6,6,6,6,0,3,1,1,1,1,1,1,1,1,1,1,1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,3,0,0,0,0,0,0,0,0,0,0,3,1,1,1,1,3,3,3,3,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,3,0,0,0,0,0,0,0,0,0,0,0,0,3,1,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,1,1,1,1,1,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,3,3,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,3,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,4,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,4,5,1,1,1,4,5,1,1,3,3,3,3,0,0,3,3,3,3,1,1,3,3,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,5,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,0,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,3,0,0,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,8,1,1,1,0,0,0,0,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,0,
0,0,0,3,3,1,1,1,1,1,1,1,1,1,1,1,1,1,4,5,1,1,3,1,1,3,3,1,1,1,1,1,1,1,4,5,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,0,0,3,1,1,1,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,1,0,0,3,1,1,1,1,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,0,0,0,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,0,0,0,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,0,0,0,0,3,3,3,3,3,3,3,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,3,3,1,1,1,1,1,1,1,3,3,3,3,3,3,3,3,3,0,0,0,

0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,0,0,0,0,0,0,0,6,6,6,6,6,6,6,0,0,0,0,0,0,0,0,0,0,0,0,

0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
];

level[1] = [
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,

0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,1,1,1,1,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,0,6,6,6,6,0,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,0,0,0,0,0,0,0,0,3,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,0,0,0,0,0,0,0,0,0,0,3,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,3,3,3,3,3,3,3,3,3,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,3,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,1,1,1,1,1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,3,0,6,6,6,6,6,6,0,3,1,1,1,1,1,1,1,1,1,1,1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,3,0,0,0,0,0,0,0,0,0,0,3,1,1,1,1,3,3,3,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,3,0,0,0,0,0,0,0,0,0,0,0,0,3,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,3,3,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,3,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,4,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,4,5,1,1,1,4,5,1,1,3,3,3,3,0,0,3,3,3,3,1,1,3,3,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,5,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,3,1,1,1,3,1,1,1,3,1,1,1,3,1,1,1,3,1,1,1,3,1,1,1,4,5,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,5,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,5,1,1,1,1,1,1,1,0,0,0,
0,0,0,3,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,1,1,3,1,1,3,1,1,3,1,1,3,1,1,4,5,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,3,3,3,3,3,3,3,3,0,0,0,

0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,0,0,0,0,0,0,0,0,

0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
];

const tileW = 32, tileH = 32;
const mapW = 50, mapH = 50;

function drawGame(level) {
  for(let y = 0; y < mapH; ++y)
    {
        for(let x = 0; x < mapW; ++x)
        {
            switch( level[ (y*mapW)+x ] )
            {
                case 0:
                    //ctx.fillStyle = "#000000";
                    _blocks.push(new Block( tileCenter, x*tileW, y*tileH, tileW, tileH, ));
                    break;
                case 1:
                    //ctx.fillStyle = "gold";
                    break;
                case 2:
                    _blocks.push(new Block( tileLeft, x*tileW, y*tileH, tileW, tileH, ));
                    break;   
				case 3:
					_blocks.push(new Block( tileTop, x*tileW, y*tileH, tileW, tileH, ));
					break;
				
				case 4:
					_blocks.push(new Block( tileLeftJump, x*tileW, y*tileH, tileW, tileH, ));
					break;
					
				case 5:
					_blocks.push(new Block( tileRightJump, x*tileW, y*tileH, tileW, tileH, ));
					break;
					
				case 6:
					_blocks.push(new LavaBlock( tileWaterTop, x*tileW, y*tileH, tileW, tileH, ));
					break;
				
				case 7:
					_blocks.push(new LavaBlock( tileWaterMid, x*tileW, y*tileH, tileW, tileH, ));
					break;
				case 8:
					_blocks.push(new Block( tileRight, x*tileW, y*tileH, tileW, tileH, ));
					break;
				
                default:
                    //ctx.fillStyle = "#fff";
                    break;
            }

            //ctx.fillRect( x*tileW, y*tileH, tileW, tileH);
        }
    }
}

/* window.onload = function()
{
    cnv = document.getElementById('canvas');
    cnv.width = cnv.height = 940;
    ctx = cnv.getContext("2d");
    drawGame();
}; */

///////////////////////////////////////////////
////////////////              /////////////////
///////////////////////////////////////////////


///////////////////////////////////////////////
//////////////// CONTROLS CLASS ///////////////
///////////////////////////////////////////////

function Controls(x, y, width, height, dir) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.dir = dir; // Direction
  
  
  // Draw method
  this.draw = function() {
    //c.save()
    //c.fillStyle = "rgba(0, 0, 0, 0.5)";
    c2.rect(this.x, this.y, this.width, this.height);
    //c.strokeStyle = "#000";
    //c.fill();
    //c.stroke();
    //c.restore();
    //c.closePath();
    
    // Arrow drawings by Martin
    let m = 10, // Margin left right top and bottom
        w = this.width-2*m,
        h = this.height-2*m,
        d = h/2,
        t = 12, // Tail thickness => tail is =
        x = this.x, y = this.y;
    
    // If left || right || up arrow
    
    if(this.dir === "left"){
      // Left arrow
      //c.save();
      c2.fillStyle = "rgba(0, 0, 0, 0.4)";
      //c.fill();
      c2.lineWidth = 0.5;
      c2.stroke();
      c2.beginPath();
      c2.moveTo(x+m,y+h/2+m);
      c2.lineTo(x+m+d,y+m);
      c2.lineTo(x+m+d,y+h/2+m-t/2);
      c2.lineTo(x+m+d+w-d,y+h/2+m-t/2);
      c2.lineTo(x+m+d+w-d,y+h/2+m+t/2);
      c2.lineTo(x+m+d,y+h/2+m+t/2);
      c2.lineTo(x+m+d,y+h+m);
      c2.lineTo(x+m,y+h/2+m);
      c2.fill();
      //c.restore();
      c2.closePath();
      
    }
    
    else if(this.dir === "right"){
      // Right arrow
      //c2.save();
      c2.fillStyle = "rgba(0, 0, 0, 0.4)";
      //c.fill();
      c2.lineWidth = 0.5;
      c2.stroke();
      c2.beginPath();
      c2.moveTo(x+w+m,y+h/2+m);
      c2.lineTo(x+w+m-d,y+m);
      c2.lineTo(x+w+m-d,y+h/2+m-t/2);
      c2.lineTo(x+m,y+h/2+m-t/2);
      c2.lineTo(x+m,y+h/2+m+t/2);
      c2.lineTo(x+m+w-d,y+h/2+m+t/2);
      c2.lineTo(x+m+w-d,y+h+m);
      c2.lineTo(x+w+m,y+h/2+m);
      c2.fill();
      //c2.restore();
      c2.closePath();
      
    }
    
    else if(this.dir === "up"){
      // Up arrow
      //c2.save();
      c2.fillStyle = "rgba(0, 0, 0, 0.4)";
      //c.fill();
      c2.lineWidth = 0.5;
      c2.stroke();
      c2.beginPath();
      c2.moveTo(this.x + 8, this.y + 35);
      c2.lineTo(this.x + 28, this.y + 10);
      c2.lineTo(this.x + 48, this.y + 35);
      c2.fill();
      c2.stroke();
      //c2.restore();
      c2.closePath();
    }
    
  };
  
  // Update method
  this.update = function(){
    this.draw();
  };
  
  
}

///////////////////////////////////////////////
////////////////              /////////////////
///////////////////////////////////////////////


/////////////////////////////////////////////
////////////// TOUCH CONTROLS ///////////////
/////////////////////////////////////////////

// Touch function to get touch position
function getTouchXY(e) {
  right_down = left_down = up_down = false;
    for(var i in e.touches) {
      let x = e.touches[i].clientX,
          y = e.touches[i].clientY,
          t = {x:x, y:y, width:10, height:10};
        //if(collision2(t,shoot)) shoot_down = true; 
        if(collision2(t,right)) {
          right_down = true
        };
        if(collision2(t,left)) {
          left_down = true;
        }
        if(collision2(t,up)) {up_down = true;}
    }
}

// Stop Touch function
function stopTouchXY(e){
    let x = e.changedTouches[0].clientX,
        y = e.changedTouches[0].clientY,
        t = {x: x, y: y, width:10, height:10},
        //sc = collision2(t, shoot),
        rc = collision2(t, right),
        lc = collision2(t, left),
        uc = collision2(t, up);
    //if(sc) shoot_down = false;    
    if(rc) {right_down = false;}
    if(lc) {left_down = false;}
    if(uc) {up_down = false;}
}

///////////////////////////////////////////////
////////////////              /////////////////
///////////////////////////////////////////////

/////////////////////////////////////////////
//////////////// KEY CONTROLS ///////////////
/////////////////////////////////////////////

const keyBoardL = (e) => {
  if(e.keyCode == 37){
    left_down = true;
  }
};

const stopKeyBoardL = (e) => {
  if(e.keyCode == 37){
    left_down = false;
  }
};

const keyBoardR = (e) => {
  if(e.keyCode == 39){
    right_down = true;
  }
};

const stopKeyBoardR = (e) => {
  if(e.keyCode == 39){
    right_down = false;
  }
};

const keyBoardUP = (e) => {
  if(e.keyCode == 38){
    up_down = true;
  }
};

const stopKeyBoardUP = (e) => {
  if(e.keyCode == 38){
    up_down = false;
  }
};

///////////////////////////////////////////////
////////////////              /////////////////
///////////////////////////////////////////////


/////////////////////////////////////////////
///////////////// LISTENERS /////////////////
/////////////////////////////////////////////

const listeners = () => {
  canvas2.addEventListener("touchstart",  getTouchXY);
  canvas2.addEventListener("touchmove",   getTouchXY);
  canvas2.addEventListener("touchend",    stopTouchXY);
  canvas2.addEventListener("touchcancel", stopTouchXY);
  window.addEventListener("keydown",     keyBoardL);
  window.addEventListener("keyup",       stopKeyBoardL);
  window.addEventListener("keydown",     keyBoardR);
  window.addEventListener("keyup",       stopKeyBoardR);
  window.addEventListener("keydown",     keyBoardUP);
  window.addEventListener("keyup",       stopKeyBoardUP);
  // iOS preventDefault on zooming!
  document.addEventListener("gesturestart", function(e) {
    e.preventDefault();
  });
};


///////////////////////////////////////////////
////////////////              /////////////////
///////////////////////////////////////////////


///////////////////////////////////////////////
//// INIT: SPAWN & DRAW & SPRITE FUNCTIONS ////
///////////////////////////////////////////////

// Spawn hero player
const spawnPlayerLVL0 = () => {
  player = new Player(/*x = */70, /*y = */(CH+120), /*width = */28, /*height = */40);
  //player = new Player( 710, 280, /*width = */28, /*height = */40);
};

// Load game images
const loadImages = () => {
  // Tiles
  tileLeft = new Image();
  tileLeft.src = 'img/Tiles/1.png'; //"https://i.ibb.co/NmNHhX2/tileLeft.png";
  tileRight = new Image();
  tileRight.src = 'img/Tiles/3.png';
  tileTop = new Image();
  tileTop.src = 'img/Tiles/2.png';
  tileCenter = new Image();
  tileCenter.src = 'img/Tiles/5.png';
	
  tileLeftJump = new Image();
  tileLeftJump.src = 'img/Tiles/13.png';
  tileRightJump = new Image();
  tileRightJump.src = 'img/Tiles/15.png';
	
  tileWaterTop = new Image();
  tileWaterTop.src = 'img/Tiles/17.png';
  tileWaterMid = new Image();
  tileWaterMid.src = 'img/Tiles/18.png';
	
  // Objects - no collisions, just decoration images
  sign = new Image();
  sign.src = 'img/Object/Sign_2.png';
	
  tree1 = new Image();
  tree1.src = 'img/Object/Tree_2.png';
	
  tree2 = new Image();
  tree2.src = 'img/Object/Tree_3.png';
	
  tree3 = new Image();
  tree3.src = 'img/Object/Tree_1.png';
	
  bush1 = new Image();
  bush1.src = 'img/Object/Bush_1.png';
	
  stone = new Image();
  stone.src = 'img/Object/Stone.png';
};

// Draw images
const drawObjectsLVL0 = () => {
  _objects.push(new Objects(sign, 110, (CH+245), 62, 64));
  _objects.push(new Objects(tree1, 200, 1045, 282, 301));
  _objects.push(new Objects(tree2, 1200, 210, 282, 301));
  _objects.push(new Objects(tree3, 1268, 1300, 116, 44));
  _objects.push(new Objects(bush1, 1196, 468, 73, 47));
  _objects.push(new Objects(stone, 920, 590, 90, 54));
};

// Spawn sun (finishing object)
const spawnSunLVL0 = () => {
  //sun = new Sun( 710, 280, 50, 50 );
  //sun = new Sun( 300, CH + 220, 50, 50 );
  sun = new Sun( 155, 140, 50, 50 );
};

// Draw controls on second canvas so I can draw it only once
const drawControls = () => {
  left  = new Controls(20, innerHeight - 82, 80, 50, "left");    
  right = new Controls(110, innerHeight - 82, 80, 50, "right");
  up = new Controls(canvas2.width-60, innerHeight - 82, 57, 50, "up");
  
  left.update();
  right.update();
  up.update();
};

// Spawn enemies
const spawnEnemyLVL0 = () => {
  _enemies.push( new Enemy(224, 1285, 36, 64, 224, 418) );
  _enemies.push( new Enemy(1196, 1285, 36, 64, 1196, 1470) );
  
  _enemies.push( new Enemy(926, 836, 36, 64, 926, 1036) );
  _enemies.push( new Enemy(726, 836, 36, 64, 726, 832) );
  
  _enemies.push( new Enemy(92, 706, 36, 64, 92, 168) );
  
  _enemies.push( new Enemy(880, 580, 36, 64, 880, 1000) );
  
  _enemies.push( new Enemy(1174, 450, 36, 64, 1174, 1470) );
  _enemies.push( new Enemy(1460, 450, 36, 64, 1174, 1470) );
  
  
};

// Handle spritesheet animation
const spriteAnimations = () => {
    // Right Run animation
    setInterval(()=> {
      player.anim.frameRunRightX = player.anim.frameRunRightX > 10 ? player.anim.frameRunRightX = 0 : (right_down) ? player.anim.frameRunRightX += 1 : player.anim.frameRunRightX = 0;
    },100);
	
	// Left Run animation
    setInterval(()=> {
      player.anim.frameRunLeftX = player.anim.frameRunLeftX > 10 ? player.anim.frameRunLeftX = 0 : (left_down) ? player.anim.frameRunLeftX += 1 : player.anim.frameRunLeftX = 0;
    },100);
    
    // Right Idle animation
    setInterval(()=> {
      player.anim.frameIdleRightX = player.anim.frameIdleRightX > 4 ? player.anim.frameIdleRightX = 0 : (player.idle && player.direction === "right") ? player.anim.frameIdleRightX += 1 : player.anim.frameIdleRightX = 0;
     },500);
	 
	 // Left Idle animation
    setInterval(()=> {
      player.anim.frameIdleLeftX = player.anim.frameIdleLeftX > 4 ? player.anim.frameIdleLeftX = 0 : (player.idle && player.direction === "left") ? player.anim.frameIdleLeftX += 1 : player.anim.frameIdleLeftX = 0;
     },500);
     
     
	 
     // Right moving animation
    setInterval(()=> {
      for(let i = _enemies.length - 1; i >= 0; i--) {
      _enemies[i].anim.frameRunRightX = _enemies[i].anim.frameRunRightX > 7 ? _enemies[i].anim.frameRunRightX = 0 :  _enemies[i].anim.frameRunRightX += 1;
      }
    },100);
	
	// Left moving animation
	setInterval(()=> {
      for(let i = _enemies.length - 1; i >= 0; i--) {
      _enemies[i].anim.frameRunLeftX = _enemies[i].anim.frameRunLeftX > 7 ? _enemies[i].anim.frameRunLeftX = 0 :  _enemies[i].anim.frameRunLeftX += 1;
      }
    },100);
};

// Render method - just a wrapper for level0 spawning mechanism
const renderLEVEL0 = () => {
  // Draw 2d array map world with level 1
  drawGame(level[0]);
  // Draw decoration image objects
  drawObjectsLVL0();
	
  // Spawn enemies, finishing sun object and hero player
  spawnEnemyLVL0();
  spawnSunLVL0();
  spawnPlayerLVL0();
};

// Clear canvas
const clear = () => {
  c.clearRect(0, 0, canvas.width, canvas.height);
};

// Update method with camera
const update = () => {
  // Save & translate for camera effect
  c.save();
  c.translate(-player.x + canvas.width/2, -player.y + canvas.height/2);
  
  // Objects, images with no collision, just decoration
  for(let i = _objects.length - 1; i >= 0; i--) {
    _objects[i].update();
  }
  
  // Update blocks
  for(let k = _blocks.length - 1; k >= 0; k--) {
    _blocks[k].update();
  }
  
  // Update Sun
  sun.update();
  
  // Update enemies
  for(let j = _enemies.length - 1; j >= 0; j--) {
    _enemies[j].update();
  }
  
  // Update player
  player.update();

  // Restore for camera effect
  c.restore();
};

///////////////////////////////////////////////
////////////////              /////////////////
///////////////////////////////////////////////


//////////////////////////////////////////  
//////////// I N I T  V A R S ////////////
//////////////////////////////////////////

// Canvas stuff
let canvas,canvas2,c,c2,CW,CH = null;
// Hero player (class Player)
let player = null;
// Sun - finishing block (class Sun)
let sun = null;
// Arrays for blocks, enemies and objects
let _blocks = [];
let _enemies = [];
let _objects = [];
let _stars = [];

// Controls (class Controls)
let right_down, left_down, up_down; // up_down lol

//////////////////////////////////////////  
///////////////            ///////////////
//////////////////////////////////////////


//////////////////////////////////////////  
/////////////// I  N  I  T ///////////////
//////////////////////////////////////////

const init = () => {
	// Init fps
    init_fps();
	// Load images
	loadImages();
	
	// Canvas stuff
    canvas = id("canvas");
    c = canvas.getContext("2d");
    canvas.width = CW = 940; // Could be innerWidth
    canvas.height = CH = 940; // Could be innerHeight
    canvas2 = id("canvas2");
    c2 = canvas2.getContext("2d");
    canvas2.width = innerWidth;
    canvas2.height = innerHeight;
	
	// Draw controls
	drawControls();
	
	// Render level 0
	renderLEVEL0();
	
	// Handle sprite animations
	spriteAnimations();
    
	// Call for eventListeners
	listeners();
	
	// Run GAMELOOP on init
    GAMELOOP();
    
};


//////////////////////////////////////////  
//////////// G A M E  L O O P ////////////
//////////////////////////////////////////

const GAMELOOP = () => {
    clear();
    update();
    update_fps();
    requestAnimationFrame(GAMELOOP);
};

//////////////////////////////////////////  
///////////////            ///////////////
//////////////////////////////////////////


////////////////////////////////////////
///////// O N L O A D = I N I T ////////
////////////////////////////////////////

onload = init;