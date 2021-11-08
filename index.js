const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const MOUSE_RADIUS = 100;

const PARTICLE_DEFAULT_RADIUS = 1;
const PARTICLE_DEFAULT_COLOR = "white";
const PARTILE_RETURN_BASE_LOCATION_SPEED = 0.1;
const DISTANCE_BETWEEN_PARTICLE_FACTOR = 1;

// const PARTICLE_POSITION_ADJUSTMENT_X =
//     (canvas.width / 2) * DISTANCE_BETWEEN_PARTICLE_FACTOR;
// const PARTICLE_POSITION_ADJUSTMENT_Y =
//     (canvas.height / 2) * DISTANCE_BETWEEN_PARTICLE_FACTOR;
const PARTICLE_POSITION_ADJUSTMENT_X = 0;
const PARTICLE_POSITION_ADJUSTMENT_Y = 0;
const INPUT_IMAGE_WIDTH = canvas.width;
const INPUT_IMAGE_HEIGHT = canvas.height;

var mouse = {
    x: 0,
    y: 0,
};
var particles = [];

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
    });
    particles.forEach((particle) => {
        particle.render();
    });
    // console.time("a");
    // console.timeEnd("a");
    requestAnimationFrame(loop);
}

function readImageInput(inputCoordinate) {
    let array = [];
    for (let i = 0; i < inputCoordinate.width; i++)
        for (let j = 0; j < inputCoordinate.height; j++) {
            let x = 4 * i + 4 * j * inputCoordinate.height;
            let red = inputCoordinate.data[x];
            let green = inputCoordinate.data[x + 1];
            let blue = inputCoordinate.data[x + 2];
            let opacity = inputCoordinate.data[x + 3];
            if (opacity > 255 / 2) {
                let color = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
                array.push(
                    new Particle(
                        i * DISTANCE_BETWEEN_PARTICLE_FACTOR +
                            PARTICLE_POSITION_ADJUSTMENT_X,
                        j * DISTANCE_BETWEEN_PARTICLE_FACTOR +
                            PARTICLE_POSITION_ADJUSTMENT_Y,
                        color,
                        PARTICLE_DEFAULT_RADIUS
                    )
                );
            }
        }
    return array;
}

function init() {
    window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

let image = new Image();
image.src = "spiderman.png";

image.onload = () => {
    init();
    ctx.drawImage(image, 0, 0);
    console.log(image.width, image.height);
    let data = ctx.getImageData(0, 0, 500, 500); // ???
    particles = readImageInput(data);
    loop();
};
