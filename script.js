let jogo;
let MODELOS_FRUTA;

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // definicoes visuais
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

// --- classe do jogador (pinguim com flutuacao e queda rapida!) ---
class Pinguim {
    constructor() {
        this.esteiraY = height * 0.52; 
        this.posicao = createVector(width * 0.25, this.esteiraY - 120); 
        this.velocidade = createVector(0, 0);
        
        this.gravidadeBase = 0.5;
        this.gravidadeFlutuar = 0.22; 
        this.forcaQuedaRapida = 1.2;  
        this.forcaPulo = -13;         
        
        this.tamanho = 75;
        this.temporizadorAtordoado = 0; 
        this.tipoErroAtual = ""; // guarda se foi "ESTEIRA" ou "FRUTA_ERRADA"
        this.escalaImpactoX = 1.0;
        this.escalaImpactoY = 1.0;
        
        this.pular(); 
    }

    pular() {
        this.velocidade.y = this.forcaPulo;
        this.escalaImpactoY = 1.3;
        this.escalaImpactoX = 0.8;
    }

    atualizar() {
        if (this.temporizadorAtordoado > 0) {
            this.temporizadorAtordoado--;
        }

        if (keyIsDown(LEFT_ARROW) || keyIsDown(65) || keyIsDown(97)) { 
            this.posicao.x -= 7.5;
        }
        if (keyIsDown(RIGHT_ARROW) || keyIsDown(68) || keyIsDown(100)) { 
            this.posicao.x += 7.5;
        }

        let gravidadeAtual = this.gravidadeBase;
        
        if (keyIsDown(UP_ARROW) || keyIsDown(87) || keyIsDown(119)) {
            gravidadeAtual = this.gravidadeFlutuar; 
        } else if (keyIsDown(DOWN_ARROW) || keyIsDown(83) || keyIsDown(115)) {
            this.velocidade.y += this.forcaQuedaRapida; 
        }

        this.velocidade.y += gravidadeAtual;
        this.posicao.add(this.velocidade);

        this.escalaImpactoX += (1.0 - this.escalaImpactoX) * 0.15;
        this.escalaImpactoY += (1.0 - this.escalaImpactoY) * 0.15;
        this.posicao.x = constrain(this.posicao.x, 80, width - 80);
    }

    forçarQuiqueEsteira() {
        this.posicao.y = this.esteiraY - 12;
        this.velocidade.y = -9; 
        this.temporizadorAtordoado = 30; 
        this.tipoErroAtual = "ESTEIRA";
        this.escalaImpactoY = 0.6;
        this.escalaImpactoX = 1.3;
    }

    desenhar() {
        push();
        translate(this.posicao.x, this.posicao.y);
        scale(this.escalaImpactoX, this.escalaImpactoY);
        
        stroke('#10141d');
        strokeWeight(4);

        if (this.temporizadorAtordoado > 0) {
            fill('#7f8c8d'); 
        } else {
            fill('#0052a3');
        }

        ellipse(0, -this.tamanho/2, this.tamanho, this.tamanho * 1.1);
        fill('#ffffff'); noStroke();
        ellipse(0, -this.tamanho/2 + 5, this.tamanho * 0.7, this.tamanho * 0.8);
        
        fill('#27ae60'); stroke('#10141d'); rectMode(CENTER);
        rect(0, -this.tamanho/3, this.tamanho * 0.5, this.tamanho * 0.4, 4);

        fill('#f39c12');
        triangle(-12, -this.tamanho/2 - 2, 12, -this.tamanho/2 - 2, 0, -this.tamanho/2 + 8);
        fill(0); noStroke();
        ellipse(-8, -this.tamanho/2 - 12, 6, 8);
        ellipse(8, -this.tamanho/2 - 12, 6, 8);
        pop();
    }
}