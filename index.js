const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const TEXT_INITAL_X = 0;
const TEXT_SIZE = 50;
const TEXT_INITAL_Y = TEXT_SIZE;

var text = "Ball Blast";
ctx.font = `${TEXT_SIZE}px Arial`;
ctx.fillStyle = "red";
ctx.fillText(text, TEXT_INITAL_X, TEXT_INITAL_Y);

const CONTENT_WIDTH = ctx.measureText(text).width;
const MOUSE_RADIUS = 100;

const PARTICLE_DEFAULT_RADIUS = 2;
const PARTICLE_DEFAULT_COLOR = "white";
const PARTILE_RETURN_BASE_LOCATION_SPEED = 0.1;
const DISTANCE_BETWEEN_PARTICLE_FACTOR = 5;

const PARTICLE_POSITION_ADJUSTMENT_X =
    canvas.width / 2 - (CONTENT_WIDTH / 2) * DISTANCE_BETWEEN_PARTICLE_FACTOR;
const PARTICLE_POSITION_ADJUSTMENT_Y =
    canvas.height / 2 - TEXT_SIZE * DISTANCE_BETWEEN_PARTICLE_FACTOR;
const INPUT_IMAGE_WIDTH = canvas.width;
const INPUT_IMAGE_HEIGHT = canvas.height;

var mouse = {
    x: 0,
    y: 0,
};
var particles = [];

var inputCoordinate = ctx.getImageData(
    0,
    0,
    INPUT_IMAGE_WIDTH,
    INPUT_IMAGE_WIDTH
);

class Particle {
    constructor(x, y, color, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.baseX = x;
        this.baseY = y;
        this.distance;
    }

    update() {
        const getDistance = (a, b, c, d) => {
            let X = a - c;
            let Y = b - d;
            let distance = Math.sqrt(X * X + Y * Y) + 1e-5;
            return distance;
        };

        const getSpeed = (a, b, c, d) => {
            let X = c - a;
            let Y = d - b;
            let speed = {
                x:
                    (X / this.distance) *
                    ((MOUSE_RADIUS - this.distance) / MOUSE_RADIUS),
                y:
                    (Y / this.distance) *
                    ((MOUSE_RADIUS - this.distance) / MOUSE_RADIUS),
            };
            return speed;
        };

        this.distance = getDistance(this.x, this.y, mouse.x, mouse.y);
        if (this.distance < MOUSE_RADIUS) {
            let speed = getSpeed(mouse.x, mouse.y, this.x, this.y);
            this.x += speed.x * 50;
            this.y += speed.y * 50;
        }
        if (this.distance > MOUSE_RADIUS) {
            let limitX =
                ((this.x - mouse.x) / this.distance) * MOUSE_RADIUS + mouse.x;
            let limitY =
                ((this.y - mouse.y) / this.distance) * MOUSE_RADIUS + mouse.y;
            /**
             * this.x + X = baseX
             *  => this.x = baseX - X (1)
             * dx = this.x - baseX
             *  => this.x = dx + baseX (2)
             *
             * (1)(2)
             * baseX - X = dx + baseX
             *  => X = -dx
             *
             * ==> this.x - dx = baseX
             */
            let dx = this.x - this.baseX;
            let dy = this.y - this.baseY;

            this.x -= dx * PARTILE_RETURN_BASE_LOCATION_SPEED;
            this.y -= dy * PARTILE_RETURN_BASE_LOCATION_SPEED;
            if (getDistance(this.x, this.y, mouse.x, mouse.y) < MOUSE_RADIUS) {
                this.x = limitX;
                this.y = limitY;
            }
        }
    }

    render() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function loop() {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle) => {
        particle.update();
        particle.render();
    });
    requestAnimationFrame(loop);
}

function readImageInput() {
    let array = [];
    for (let i = 0; i < inputCoordinate.width; i++)
        for (let j = 0; j < inputCoordinate.height; j++) {
            let x = 4 * i + 4 * j * inputCoordinate.height + 3;
            let opacity = inputCoordinate.data[x];
            if (opacity > 255 / 2) {
                array.push(
                    new Particle(
                        i * DISTANCE_BETWEEN_PARTICLE_FACTOR +
                            PARTICLE_POSITION_ADJUSTMENT_X,
                        j * DISTANCE_BETWEEN_PARTICLE_FACTOR +
                            PARTICLE_POSITION_ADJUSTMENT_Y,
                        PARTICLE_DEFAULT_COLOR,
                        PARTICLE_DEFAULT_RADIUS
                    )
                );
            }
        }
    return array;
}

function init() {
    particles = readImageInput();
    window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    loop();
}

init();
