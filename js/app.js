// Get the stage, all the canvases will be inside of this element
const stage = document.querySelector('#stage');
// Where we set the time left
const timer = document.querySelector('#time-left');
// Where we set the score or the number of smashed monsters
const monstersSmashed = document.querySelector('#smashed');

// The Monster Object contains everything regarding the monster
let monster = {
  // All the variables
  tileSheet: '',
  src: 'tileSheetImg/monsterTileSheet.png',

  // Size of each frame
  frameSize: 128,
  // Total frames that we have
  totalFrames: 5,
  // Used to store the current frame we are at
  currentFrame: 0,
  // Total columns in the tileSheet image
  columns: 3,

  // What part of the tileSheet image we want to display
  sourceX: 0,
  sourceY: 0,

  // Monster states
  hiding: 0,
  jumping: 1,
  hit: 2,
  // Used to store the current monster state
  state: '',
  // Used to check if the monster is moving forward or not
  forword: false,

  // Used to store the time after which the monster will start jumping
  waitTime: '',
  // Used to store the time after which the hit state will be removed
  delay: 15,

  // Used to score the time
  time: 30,

  // Used to store a reference to the setInterval of the timer function
  timerInterval: '',
  // Used to store a reference to the setInterval of the startAnimation function
  gameInterval: '',

  // All the methods/Functions
  // Find a random time after which the monster should start jumping
  findRandTime() {
    // Finds a random number between 1 and 60
    this.waitTime = parseInt(Math.random() * 60) + 1;
  },

  // Timer function
  timer() {
    // Start the timer
    if (this.time === 30) {
      this.timerInterval = setInterval(() => {
        this.time--;
        timer.textContent = this.time;
        // Stop the timer and the game when time = 0
        if (this.time === 0) {
          // Stop the timer
          clearInterval(this.timerInterval);
          // Stop the game
          clearInterval(this.gameInterval);
        }
      }, 1000);
    }
  },

  // Used to draw the monster
  drawMonster() {
    /* Loop through the monster objects and draw them on their respective
    canvases */
    for (let i = 0; i < monsterObjects.length; i++) {
      // Get the monster
      var monster = monsterObjects[i];
      // Get the context of the monster
      var ctx = monsterCtx[i];

      // Draw the monster
      ctx.drawImage(
        this.tileSheet,
        monster.sourceX,
        monster.sourceY,
        this.frameSize,
        this.frameSize,
        0,
        0,
        this.frameSize,
        this.frameSize
      );
    }
  },

  // Used to move the monster
  moveMonster() {
    // Figure out the monster's state
    if (this.state !== this.hit) {
      if (this.waitTime > 0) {
        this.state = this.hiding;
      } else {
        this.state = this.jumping;
      }
    }

    // Make the monster move based on its state
    switch (this.state) {
      case this.hiding:
        this.waitTime--;
        this.currentFrame = 0;
        break;

      case this.jumping:
        // If the last frame has been reached, set forward to false
        if (this.currentFrame === this.totalFrames) {
          this.forword = false;
        }

        // If the first frame has been reached, set forward to true
        if (this.currentFrame === 0 && this.forword === false) {
          // Set forward to true, find a new waitTime
          this.forword = true;
          this.findRandTime();
          break;
        }

        // Add 1 to currentFrame if forward is true, subtract 1 if it's false
        if (this.forword) {
          this.currentFrame++;
        } else {
          this.currentFrame--;
        }
        break;

      case this.hit:
        // If delay is zero then reset the animation
        if (this.delay === 0) {
          this.state = this.hiding;
          this.currentFrame = 0;
          this.forward = false;
          this.delay = 20;
          this.findRandTime();
        }

        /* If delay is greater than zero, then set the current frame to 6
        so that the hit state will be displayed also decrease 1 from the 
        delay variable. We are doing this so that the hit state will persist
        for sometime after it is displayed*/
        if (this.delay > 0) {
          this.currentFrame = 6;
          this.delay--;
        }
        break;
    }

    // Determine which part of the tileSheet image to display
    this.sourceX = parseInt(this.currentFrame % this.columns) * this.frameSize;
    this.sourceY = parseInt(this.currentFrame / this.columns) * this.frameSize;
  },

  // Used to start the animation and load the tileSheet image
  startAnimation() {
    // Initilize the image
    this.tileSheet = new Image();
    this.tileSheet.src = this.src;
    // Start the timer
    this.timer();

    // Do the following when the image loads
    this.tileSheet.addEventListener('load', () => {
      this.gameInterval = setInterval(() => {
        // Draw the monster
        this.drawMonster();
        //  Move the monster
        this.moveMonster();
      }, 60);
    });
  },
};

// Variables used in the creation of the canvases
let rows = 4;
let columns = 3;
let size = 128;
let padding = 10;
let monsterObjects = [];
let monsterCanvases = [];
let monsterCtx = [];
let score = 0;

// Function for the creation of monster objects and their canvases
function buildMap() {
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      // Create a new monster
      var newMonster = Object.create(monster);
      // monster.findRandTime();
      monsterObjects.push(newMonster);

      // Create a canvas for the new monster
      var canvas = document.createElement('canvas');
      canvas.setAttribute('width', size);
      canvas.setAttribute('height', size);
      stage.appendChild(canvas);
      canvas.style.top = row * (size + padding) + 'px';
      canvas.style.left = column * (size + padding) + 'px';
      canvas.addEventListener('mousedown', mouseDownHandler);
      monsterCanvases.push(canvas);

      // Drawing context for the canvas
      var drawingArea = canvas.getContext('2d');
      monsterCtx.push(drawingArea);
    }
  }
}

// Used to handle the click event
function mouseDownHandler(e) {
  // Get the canvas on which the click event happened
  var clickedMonster = e.target;
  // Loop through the monster Objects
  for (let i = 0; i < monsterObjects.length; i++) {
    // Get the monster
    var monster = monsterObjects[i];
    // Get its canvas
    var canvas = monsterCanvases[i];
    // If the monster is jumping
    if (monster.state === monster.jumping) {
      /* Compare the canvas of the current monster we are lopping through
      to the canvas that was clicked, if they match then change the satte
      of the current monster we are lopping through to 'hit' */
      if (canvas === clickedMonster) {
        monster.state = monster.hit;
        // Inscrase the score
        score++;
        // Set the score
        monstersSmashed.textContent = score;
      }
    }
  }
}

// Build the map(Set everything monster objects and their canvases etc)
buildMap();

/* Loop through the monster objects array and run the start animation method
of each object */
for (let i = 0; i < monsterObjects.length; i++) {
  monsterObjects[i].startAnimation();
}
