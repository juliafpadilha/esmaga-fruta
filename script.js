let jogo;
let MODELOS_FRUTA;

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // definicoes visuais com tamanho aumentado (1.4x)
    MODELOS_FRUTA = {
        'Morango': { cor: '#ff2a4b', corFolha: '#2ecc71', tipo: 'morango', raio: 32 },
        'Banana':  { cor: '#f1c40f', corFolha: '#d35400', tipo: 'banana', raio: 35 },
        'Uva':     { cor: '#8e44ad', corFolha: '#27ae60', tipo: 'uva', raio: 30 },
        'Laranja': { cor: '#e67e22', corFolha: '#27ae60', tipo: 'laranja', raio: 32 },
        'Maçã':    { cor: '#2ed573', corFolha: '#26af50', tipo: 'maca', raio: 32 }
    };

    jogo = new MotorJogo();
}

function draw() {
    jogo.atualizar();
    jogo.renderizar();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
    jogo.lidarCliqueMouse();
}

// --- sistema de particulas ---
class ParticulaSuco {
    constructor(x, y, cor) {
        this.posicao = createVector(x, y);
        this.velocidade = p5.Vector.random2D().mult(random(3, 8));
        this.velocidade.y -= random(2, 5);
        this.cor = cor;
        this.tamanho = random(8, 14);
        this.gravidade = 0.25;
        this.alfa = 255;
    }
    atualizar() {
        this.velocidade.y += this.gravidade;
        this.posicao.add(this.velocidade);
        this.alfa -= 7;
    }
    desenhar() {
        push();
        noStroke();
        let c = color(this.cor);
        c.setAlpha(this.alfa);
        fill(c);
        ellipse(this.posicao.x, this.posicao.y, this.tamanho);
        pop();
    }
}