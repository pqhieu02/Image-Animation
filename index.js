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
// const INPUT_IMAGE_WIDTH = 20;
// const INPUT_IMAGE_HEIGHT = 30;

var mouse = {
    x: -canvas.width,
    y: -canvas.height,
};
var particles = [];
var output = ctx.createImageData(canvas.width, canvas.height);

class Particle {
    constructor(x, y, color, colorObject, radius) {
        this.x = x;
        this.y = y;
        this.preX = null;
        this.preY = null;
        this.radius = radius;
        this.color = color;

        this.red = colorObject.red;
        this.green = colorObject.green;
        this.blue = colorObject.blue;
        this.opacity = colorObject.opacity;

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
        // if (this.distance === MOUSE_RADIUS) return;
        this.preX = this.x;
        this.preY = this.y;
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
        console.log();
        ctx.beginPath();
        ctx.fillStyle = this.color;
        console.log(this.radius);
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function updateImageData(particle) {
    let radius = particle.radius;

    let startPreX = Math.max(0, Math.floor(particle.preX - radius));
    let endPreX = Math.min(canvas.width, Math.floor(particle.preX + radius));
    let startPreY = Math.max(0, Math.floor(particle.preY - radius));
    let endPreY = Math.min(canvas.height, Math.floor(particle.preY + radius));

    for (let x = startPreX; x < endPreX; x++)
        for (let y = startPreY; y < endPreY; y++) {
            let location = 4 * x + 4 * y * canvas.width;
            output.data[location] = 0;
            output.data[location + 1] = 0;
            output.data[location + 2] = 255;
            output.data[location + 3] = 0;
        }

    let startX = Math.max(0, Math.floor(particle.x - radius));
    let endX = Math.min(canvas.width, Math.floor(particle.x + radius));
    let startY = Math.max(0, Math.floor(particle.y - radius));
    let endY = Math.min(canvas.height, Math.floor(particle.y + radius));

    for (let x = startX; x < endX; x++)
        for (let y = startY; y < endY; y++) {
            let location = 4 * x + 4 * y * canvas.width;
            output.data[location] = particle.red;
            output.data[location + 1] = particle.blue;
            output.data[location + 2] = particle.green;
            // output.data[location] = 255;
            // output.data[location + 1] = 255;
            // output.data[location + 2] = 255;
            output.data[location + 3] = particle.opacity;
        }
}

function loop() {
    // console.time("a");
    // console.timeEnd("a");
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle) => {
        particle.update();
        updateImageData(particle);
    });
    ctx.putImageData(output, 0, 0);
    // particles.forEach((particle) => {
    //     particle.render();
    // });

    requestAnimationFrame(loop);
}

function readImageInput(inputData) {
    let array = [];
    for (let i = 0; i < inputData.width; i++)
        for (let j = 0; j < inputData.height; j++) {
            let x = 4 * i + 4 * j * inputData.width;
            let red = inputData.data[x];
            let green = inputData.data[x + 1];
            let blue = inputData.data[x + 2];
            // let red = 255;
            // let green = 255;
            // let blue = 255;
            let opacity = inputData.data[x + 3];
            if (opacity > 255 / 2) {
                if (red === 0 && green === 0 && blue === 0) continue;
                let color = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
                let colorObject = {
                    red: red,
                    green: green,
                    blue: blue,
                    opacity: opacity,
                };
                let particle = new Particle(
                    i * DISTANCE_BETWEEN_PARTICLE_FACTOR +
                        PARTICLE_POSITION_ADJUSTMENT_X,
                    j * DISTANCE_BETWEEN_PARTICLE_FACTOR +
                        PARTICLE_POSITION_ADJUSTMENT_Y,
                    color,
                    colorObject,
                    PARTICLE_DEFAULT_RADIUS
                );
                array.push(particle);
                updateImageData(particle);
            }
        }
    // for (let i = 0; i < 1; i++) {
    //     let colorObject = {
    //         red: 255,
    //         green: 0,
    //         blue: 0,
    //         opacity: 255,
    //     };
    //     array.push(new Particle(100, 100, "red", colorObject, 10));
    // }
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
image.src = "image.png";

image.onload = () => {
    init();
    ctx.drawImage(image, canvas.width / 2, canvas.height / 2);
    let inputData = ctx.getImageData(
        0,
        0,
        INPUT_IMAGE_WIDTH,
        INPUT_IMAGE_HEIGHT
    );
    particles = readImageInput(inputData);
    loop();
};
