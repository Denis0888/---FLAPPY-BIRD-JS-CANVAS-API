const cvs = document.getElementById("bird");
const ctx = cvs.getContext("2d");

const sprite = new Image();
sprite.src = "img/sprite.png";

const pngScore = new Image();
pngScore.src = "img/score.png";


const SCORE_S = new Audio();
SCORE_S.src = "audio/sfx_point.wav";

const FLAP = new Audio();
FLAP.src = "audio/sfx_flap.wav";

const HIT = new Audio();
HIT.src = "audio/sfx_hit.wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "audio/sfx_swooshing.wav";

const DIE = new Audio();
DIE.src = "audio/sfx_die.wav";

let frames = 0;
const DEGREE = Math.PI / 180;

function write(value, x, y) {
    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "#000";
    ctx.font = "25px Teko";
    ctx.lineWidth = 1.5;
    ctx.fillText(value, x, y);
    ctx.strokeText(value, x, y);
}

const state = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2
}


const startBtn = {
    x: 120,
    y: 263,
    w: 83,
    h: 29
}

document.addEventListener("click", function (evt) {
    switch (state.current) {
        case state.getReady:
            state.current = state.game;
            SWOOSHING.play();
            break;
        case state.game:
            if (bird.y - bird.radius <= 0) return;
            bird.flap();
            FLAP.play();
            break;
        case state.over:
            let rect = cvs.getBoundingClientRect();
            let clickX = evt.clientX - rect.left;
            let clickY = evt.clientY - rect.top;

            if (clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h) {
                pipes.reset();
                bird.speedReset();
                score.reset();
                state.current = state.getReady;
            }
            break;
    }
});

document.addEventListener("keydown", function (evt) {
    switch (state.current) {
        case state.getReady:
            if (evt.keyCode == 32) {
                state.current = state.game;
                SWOOSHING.play();
            }
            break;
        case state.game:
            if (bird.y - bird.radius <= 0) return;
            if (evt.keyCode == 32) {
                bird.flap();
                FLAP.play();
            }
            break;
        case state.over:
            if (evt.keyCode == 13) {
                pipes.reset();
                bird.speedReset();
                score.reset();
                state.current = state.getReady;
            }
            break;
    }
});


const background = {
    sX: 0,
    sY: 0,
    w: 275,
    h: 226,
    x: 0,
    y: cvs.height - 226,

    draw() {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }

}

const foreground = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: cvs.height - 80,

    dx: 2,

    draw() {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },

    update() {
        if (state.current == state.game) {
            this.x = (this.x - this.dx) % (this.w / 2);
        }
    }
}

const bird = {
    animation: [
        { sX: 276, sY: 112 },
        { sX: 276, sY: 139 },
        { sX: 276, sY: 164 },
        { sX: 276, sY: 139 }
    ],
    x: 50,
    y: 150,
    w: 34,
    h: 26,

    radius: 12,
    frame: 0,
    gravity: 0.2,
    jump: 4,
    speed: 0,
    rotation: 0,

    draw() {
        let bird = this.animation[this.frame];
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, - this.w / 2, - this.h / 2, this.w, this.h);
        ctx.restore();
    },

    flap() {
        this.speed = - this.jump;
    },

    update() {
        this.period = state.current == state.getReady ? 10 : 4;
        this.frame += frames % this.period == 0 ? 1 : 0;
        this.frame = this.frame == this.animation.length ? 0 : this.frame;

        if (state.current == state.getReady) {
            this.y = 150; 
            this.rotation = 0 * DEGREE;
        } else {
            this.speed += this.gravity;
            this.y += this.speed;

            if (this.y + this.h / 2 >= cvs.height - 80) {
                this.y = cvs.height - 80 - this.h / 2;
                if (state.current == state.game) {
                    state.current = state.over;
                    DIE.play();
                }
            }

            if (this.speed >= this.jump) {
                this.rotation = 75 * DEGREE;
                this.frame = 1;
            } else {
                this.rotation = -15 * DEGREE;
            }
        }

    },
    speedReset() {
        this.speed = 0;
    }
}

const getReady = {
    sX: 0,
    sY: 228,
    w: 173,
    h: 152,
    x: cvs.width / 2 - 173 / 2,
    y: 80,

    draw() {
        if (state.current == state.getReady) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

            write("Press Space", this.x + 27, this.y + 175);
        }
    }

}

const gameOver = {
    sX: 175,
    sY: 228,
    w: 225,
    h: 202,
    x: cvs.width / 2 - 225 / 2,
    y: 90,

    sMedal: [
        { sX: 312, sY: 112, wh: 45 },
        { sX: 360, sY: 112, wh: 45 },
        { sX: 360, sY: 158, wh: 45 },
        { sX: 312, sY: 158, wh: 45 }
    ],
    n: 0,

    draw() {
        if (state.current == state.over) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

            if ((score.value >= 10) && (score.value < 20)) {
                this.n = 1;
            } else if ((score.value >= 20) && (score.value < 30)) {
                this.n = 2;
            } else if (score.value >= 30) {
                this.n = 3;
            }
            let medal = this.sMedal[this.n]
            ctx.drawImage(sprite, medal.sX, medal.sY, medal.wh, medal.wh, this.x + 25, this.y + 86, medal.wh, medal.wh);

            write(score.value, 225, 186);
            write(score.best, 225, 228);

            write("Press Enter", this.x + 55, this.y + this.h + 25);
        }
    }

}

const pipes = {
    position: [],

    top: {
        sX: 553,
        sY: 0
    },
    bottom: {
        sX: 502,
        sY: 0
    },

    w: 53,
    h: 400,
    gap: 100,
    maxYPos: -150,
    dx: 2.5,
    pFrame: 95,
    plusPoint: 3,

    draw() {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;

            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);

            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);
        }
    },

    update() {
        if (state.current !== state.game) return;

        if ((score.value >= 10) && (score.value < 20)) {
            this.dx = 3;
            this.pFrame = 80;
            this.plusPoint = 4,5;
        } else if ((score.value >= 20) && (score.value < 30)) {
            this.dx = 3.5;
            this.pFrame = 65;
            this.plusPoint = 5,5;
        } else if (score.value >= 30) {
            this.dx = 4;
            this.pFrame = 50;
            this.plusPoint = 7;
        }
        if (frames % this.pFrame == 0) {
            this.position.push({
                x: cvs.width,
                y: this.maxYPos * (Math.random() + 1)
            });
        }
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let bottomPipeYPos = p.y + this.h + this.gap;

            if ((bird.x + bird.radius > p.x) && (bird.x - bird.radius < p.x + this.w) && 
            (bird.y + bird.radius > p.y) && (bird.y - bird.radius < p.y + this.h)) {
                state.current = state.over;
                HIT.play();
            }
            
            if ((bird.x + bird.radius > p.x) && (bird.x - bird.radius < p.x + this.w) && 
                (bird.y + bird.radius > bottomPipeYPos) && (bird.y - bird.radius < bottomPipeYPos + this.h)) {
                state.current = state.over;
                HIT.play();
            }
            
            p.x -= this.dx;

            if (p.x + this.w <= 0) {
                this.position.shift();
            }

            if ((bird.x > p.x + this.w / 2) && (bird.x < p.x + this.w / 2 + this.plusPoint)) {
                score.value += 1;
                SCORE_S.play();
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            }
        }
    },

    reset() {
        this.position = [];
    }

}

const score = {
    best: parseInt(localStorage.getItem("best")) || 0,
    value: 0,

    table: {
        x: 250,
        y: 5,
    },

    draw() {
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";

        if (state.current == state.game) {
            ctx.drawImage(pngScore, this.table.x, this.table.y);

            write(this.value, this.table.x + 36, this.table.y + 45);
            
            write(this.best, this.table.x + 36, this.table.y + 86);
        }
    },

    reset() {
        this.value = 0;
    }
}


function draw() {
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    background.draw();
    pipes.draw();
    foreground.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
}

function update() {
    bird.update();
    foreground.update();
    pipes.update();
}

function loop() {
    update();
    draw();
    frames++;

    requestAnimationFrame(loop);
}
loop();