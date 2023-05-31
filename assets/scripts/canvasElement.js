const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

tankImage = new Image();
tankImage.src = 'assets/images/tank.png';
// tankImage.onload = gameLoop;
tankImage.onload = function () {
    var wrh = tankImage.width / tankImage.height;
    var newWidth = canvas.width;
    var newHeight = newWidth / wrh;
    if (newHeight > canvas.height) {
        newHeight = canvas.height;
        newWidth = newHeight * wrh;
    }

    ctx.drawImage(tankImage, 0, 0, newWidth, newHeight);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 90;

    prepareTankCanvas();
}

resizeCanvas();

let obstacles = [];
let shots = [];
let lastShotTime = 0; // initialize lastShotTime to 0


const circleRadius = 2;
const obstacleMinDistance = 100;

function generateObstacles() {
    for (let i = 0; i < Math.floor(Math.random() * (20 - 10 + 1) + 10); i++) {
        let obstacle = {
            x: 0,
            y: 0,
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
        };
        do {
            obstacle.x = Math.random() * canvas.width;
            obstacle.y = Math.random() * canvas.height;
        } while (isOverlap(obstacle, obstacles) || isCloseToCircle(obstacle, circleRadius, obstacleMinDistance));
        obstacles.push(obstacle);
    }
}

generateObstacles();

function isOverlap(rect, rects) {
    for (let i = 0; i < rects.length; i++) {
        let otherRect = rects[i];
        if (rect.x < otherRect.x + otherRect.width &&
            rect.x + rect.width > otherRect.x &&
            rect.y < otherRect.y + otherRect.height &&
            rect.y + rect.height > otherRect.y) {
            return true;
        }
    }
    return false;
}

function isCloseToCircle(rect, circleRadius, minDistance) {
    let circleX = canvas.width / 2;
    let circleY = canvas.height / 2;
    let rectCenterX = rect.x + rect.width / 2;
    let rectCenterY = rect.y + rect.height / 2;
    let distance = Math.sqrt((circleX - rectCenterX) ** 2 + (circleY - rectCenterY) ** 2);
    return distance < circleRadius + minDistance + Math.max(rect.width, rect.height) / 2;
}

let x = canvas.width / 2;
let y = canvas.height / 2;
let radius = Math.min(canvas.width, canvas.height) / 30;


function prepareTankCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawTank() {
    ctx.drawImage(tankImage, x, y);
}

function drawObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        let obstacle = obstacles[i];
        ctx.beginPath();
        ctx.rect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.fillStyle = 'gray';
        ctx.fill();
        ctx.closePath();
    }
}

function drawShots() {
    const speedFactor = 1.5;
    for (let i = 0; i < shots.length; i++) {
        let shot = shots[i];
        shot.x += shot.dx * speedFactor;
        shot.y += shot.dy * speedFactor;
        ctx.beginPath();
        ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();

        for (let i = 0; i < shots.length; i++) {
            let bullet = shots[i];
            adjustBullet(bullet, obstacles);
        }
    }
}

function updateTank() {
    let dx = 0;
    let dy = 0;

    if (keys[87]) dy -= 1; // w
    if (keys[65]) dx -= 1; // a
    if (keys[83]) dy += 1; // s
    if (keys[68]) dx += 1; // d

    if (keys[81] && keys[87] || keys[81] && keys[65] || keys[81] && keys[83] || keys[81] && keys[68]) {
        const currentTime = Date.now(); // get the current time in milliseconds
        if (currentTime - lastShotTime > 500) { // check if at least 0.5 seconds have passed
            lastShotTime = currentTime; // update lastShotTime to current time

            //+15 to make the bullet come out of the barrel
            let newShot = {x: x + 15, y: y, dx: dx, dy: dy, radius: 5};
            shots.push(newShot);
        }
    }

    x += dx;
    y += dy;

    // Check collision with obstacles
    for (let i = 0; i < obstacles.length; i++) {
        let obstacle = obstacles[i];

        // Calculate the distance between the circle center and the closest point on the obstacle
        let closestX = Math.max(obstacle.x, Math.min(x, obstacle.x + obstacle.width));
        let closestY = Math.max(obstacle.y, Math.min(y, obstacle.y + obstacle.height));
        let distanceX = x - closestX;
        let distanceY = y - closestY;
        let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // Check if the distance is less than the circle radius
        if (distance < radius) {
            // Adjust the circle position so that it does not intersect with the obstacle
            let directionX = distanceX >= 0 ? 1 : -1;
            let directionY = distanceY >= 0 ? 1 : -1;
            let adjustX = directionX;
            let adjustY = directionY;
            x += adjustX;
            y += adjustY;

            // Update the velocity to zero to prevent the circle from moving through the obstacle
            dx = 0;
            dy = 0;
        }

        console.log(radius);
    }

    // Keep the circle inside the screen
    x = Math.max(radius, Math.min(x, canvas.width - radius));
    y = Math.max(radius, Math.min(y, canvas.height - radius));
}

function adjustBullet(obj, obstacles) {
    for (let i = 0; i < obstacles.length; i++) {
        let obstacle = obstacles[i];

        // Calculate the distance between the object center and the closest point on the obstacle
        let closestX = Math.max(obstacle.x, Math.min(obj.x, obstacle.x + obstacle.width));
        let closestY = Math.max(obstacle.y, Math.min(obj.y, obstacle.y + obstacle.height));
        let distanceX = obj.x - closestX;
        let distanceY = obj.y - closestY;
        let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // Check if the distance is less than the object radius/size
        if (distance < obj.radius || distance < obj.size) {
            obj.radius = 0;
            obj.size = 0;
        }
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ctx.drawImage(canvas, 0, 0);
    ctx.drawImage(tankImage, x, y);
}

function gameLoop() {
    updateTank();
    render();

    drawShots();
    drawObstacles();
    drawTank();


    requestAnimationFrame(gameLoop);
}

window.addEventListener('resize', resizeCanvas);

document.addEventListener('keydown', (event) => {
    keys[event.keyCode] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.keyCode] = false;
});

let keys = {};

gameLoop();