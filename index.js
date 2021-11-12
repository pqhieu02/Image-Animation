const PARTICLE_DEFAULT_RADIUS = 1;
const PARTILE_RETURN_BASE_LOCATION_SPEED = 0.1;
const PARTICLE_MINIMUM_MASS = 5;
const PARTICLE_MAXIMUM_MASS = 50;

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var animationId;
var mouse = {
    x: -canvas.width,
    y: -canvas.height,
    radius: 50,
};
var particles = [];

var image = new Image(100, 100);
image.src = "spiderman.png";

var output;

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

        this.mass =
            Math.random() * (PARTICLE_MAXIMUM_MASS - PARTICLE_MINIMUM_MASS) +
            PARTICLE_MINIMUM_MASS;
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
                    ((mouse.radius - this.distance) / mouse.radius),
                y:
                    (Y / this.distance) *
                    ((mouse.radius - this.distance) / mouse.radius),
            };
            return speed;
        };

        this.distance = getDistance(this.x, this.y, mouse.x, mouse.y);
        if (this.distance === mouse.radius) return;
        this.preX = this.x;
        this.preY = this.y;
        if (this.distance < mouse.radius) {
            let speed = getSpeed(mouse.x, mouse.y, this.x, this.y);

            this.x += speed.x * this.mass;
            this.y += speed.y * this.mass;
        }
        if (this.distance > mouse.radius) {
            let limitX =
                ((this.x - mouse.x) / this.distance) * mouse.radius + mouse.x;
            let limitY =
                ((this.y - mouse.y) / this.distance) * mouse.radius + mouse.y;
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
            if (getDistance(this.x, this.y, mouse.x, mouse.y) < mouse.radius) {
                this.x = limitX;
                this.y = limitY;
            }
        }
    }

    render() {
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
            output.data[location + 2] = 0;
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
            output.data[location + 3] = particle.opacity;
        }
}

function loop() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
        particle.update();
        updateImageData(particle);
    });

    ctx.putImageData(output, 0, 0);

    animationId = requestAnimationFrame(loop);
}
function readImageInput(imageData) {
    let array = [];
    for (let i = 0; i < imageData.width; i++)
        for (let j = 0; j < imageData.height; j++) {
            let x = 4 * i + 4 * j * imageData.width;
            let red = imageData.data[x];
            let green = imageData.data[x + 1];
            let blue = imageData.data[x + 2];
            let opacity = imageData.data[x + 3];
            if (opacity > 255 / 2) {
                let color = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
                let colorObject = {
                    red: red,
                    green: green,
                    blue: blue,
                    opacity: opacity,
                };
                let particle = new Particle(
                    i,
                    j,
                    color,
                    colorObject,
                    PARTICLE_DEFAULT_RADIUS
                );
                array.push(particle);
            }
        }
    return array;
}

function init() {
    output = ctx.createImageData(canvas.width, canvas.height);
    ctx.drawImage(
        image,
        canvas.width / 2 - image.width / 2,
        canvas.height / 2 - image.height / 2
    );
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    particles = readImageInput(imageData);
}

function main() {
    init();
    loop();
}

console.log(canvas.width, canvas.height);
canvas.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

canvas.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cancelAnimationFrame(animationId);
    main();
});

function createImageAnimation(elementId, img) {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    image = img;
}
image.onload = () => {
    main();
};
