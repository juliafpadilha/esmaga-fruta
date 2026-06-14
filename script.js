let jogo;
let MODELOS_FRUTA;

// variáveis para os novos assets
let imgPinguim;
let imgWallpaper;
let imgBotao;
let imgBomba;
let imgBigorna;
let imgsFrutas = {};
let musicaJogo;

function preload() {
    console.log("Iniciando carregamento simplificado dos assets em ./src/...");

    imgPinguim = loadImage('./src/pinguim.png');
    imgWallpaper = loadImage('./src/wallpaper.png');
    imgBotao = loadImage('./src/botao_base.png');
    imgBomba = loadImage('./src/bomba.png');
    imgBigorna = loadImage('./src/bigorna.png');
    
    if (typeof imgsFrutas === 'undefined' || imgsFrutas === null) {
        imgsFrutas = {};
    }

    imgsFrutas['Morango'] = loadImage('./src/morango.png');
    imgsFrutas['Banana'] = loadImage('./src/banana.png');
    imgsFrutas['Uva'] = loadImage('./src/uva.png');
    imgsFrutas['Laranja'] = loadImage('./src/laranja.png');
    imgsFrutas['Maçã'] = loadImage('./src/maca.png');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    textFont('Fredoka');
    textStyle(BOLD);
    
    MODELOS_FRUTA = {
        'Morango': { cor: '#ff2a4b', tipo: 'morango', raio: 46 },
        'Banana':  { cor: '#f1c40f', tipo: 'banana', raio: 50 },
        'Uva':     { cor: '#8e44ad', tipo: 'uva', raio: 44 },
        'Laranja': { cor: '#e67e22', tipo: 'laranja', raio: 46 },
        'Maçã':    { cor: '#2ed573', tipo: 'maca', raio: 46 }
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

function desenharTexto(texto, x, y, tamanho, alinharX = CENTER, alinharY = CENTER) {
    push();
    textSize(tamanho);
    textAlign(alinharX, alinharY);
    
    fill('#4A3526');
    noStroke();
    text(texto, x + 2, y + 2);
    
    stroke('#6B4F3A');
    strokeWeight(tamanho * 0.15);
    strokeJoin(ROUND);
    
    fill('#FFF7E8');
    text(texto, x, y);
    pop();
}

// desenha o formato de coração pra vida
function desenharCoracao(x, y, tamanho) {
    push();
    translate(x, y);
    
    // metade esquerda do coração
    beginShape();
    vertex(0, -tamanho * 0.25);
    bezierVertex(-tamanho * 0.5, -tamanho * 0.75, -tamanho, -tamanho * 0.25, -tamanho * 0.05, tamanho * 0.45);
    vertex(0, tamanho * 0.55);
    endShape(CLOSE);
    
    // metade direita espelhada no eixo X
    scale(-1, 1);
    beginShape();
    vertex(0, -tamanho * 0.25);
    bezierVertex(-tamanho * 0.5, -tamanho * 0.75, -tamanho, -tamanho * 0.25, -tamanho * 0.05, tamanho * 0.45);
    vertex(0, tamanho * 0.55);
    endShape(CLOSE);
    
    pop();
}

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

class Pinguim {
    constructor() {
        this.esteiraY = height * 0.70; 
        this.largura = 130;
        this.altura = 130;
        this.posicao = createVector(width * 0.25, this.esteiraY - 100); 
        this.velocidade = createVector(0, 0);
        
        this.gravidadeBase = 0.5;
        this.gravidadeFlutuar = 0.22; 
        this.forcaQuedaRapida = 1.2;  
        this.forcaPulo = -13;         
        
        this.raioHitbox = 55; 
        
        this.temporizadorAtordoado = 0; 
        this.tipoErroAtual = ""; 
        this.escalaImpactoX = 1.0;
        this.escalaImpactoY = 1.0;
        
        this.pular(); 
    }

    pular() {
        this.velocidade.y = this.forcaPulo;
        this.escalaImpactoY = 1.2;
        this.escalaImpactoX = 0.85;
    }

    atualizar() {
        this.esteiraY = height * 0.70; 
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

    forcarQuiqueEsteira() {
        this.posicao.y = this.esteiraY - 5;
        this.velocidade.y = -9; 
        this.temporizadorAtordoado = 30; 
        this.tipoErroAtual = "ESTEIRA";
        this.escalaImpactoY = 0.7;
        this.escalaImpactoX = 1.2;
    }

    desenhar() {
        push();
        translate(this.posicao.x, this.posicao.y - this.altura / 2);
        scale(this.escalaImpactoX, this.escalaImpactoY);
        
        imageMode(CENTER);
        if (this.temporizadorAtordoado > 0 && tint) {
            tint(180, 180, 200, 255);
        }
        image(imgPinguim, 0, 0, this.largura, this.altura);
        pop();
    }
}

class ItemEsteira {
    constructor(tipo, ehAlvo) {
        this.tipo = tipo;
        this.nomeFruta = null;
        if (tipo === 'FRUTA') {
            let chaves = Object.keys(MODELOS_FRUTA);
            this.nomeFruta = random(chaves);
        }
        
        this.ativo = true;
        this.pulsacao = 0;
        this.ehAlvo = ehAlvo ? true : false;
        
        if (tipo === 'FRUTA' && this.nomeFruta) {
            this.raio = MODELOS_FRUTA[this.nomeFruta]?.raio || 46; 
        } else if (tipo === 'BIGORNA') {
            this.raio = 52; 
        } else if (tipo === 'BOMBA') {
            this.raio = 45; 
        } else {
            this.raio = 32;
        }

        this.esteiraY = height * 0.70;
        if (this.tipo === 'BIGORNA') {
            this.posicao = createVector(width + 50, height * 0.1); 
            this.velocidade = createVector(-jogo.velocidadeAtual * 0.6, 0); 
            this.gravidade = 0.4;
            this.contagemQuiques = 0;
        } else {
            this.posicao = createVector(width + 60, this.esteiraY);
        }
    }

    atualizar() {
        this.esteiraY = height * 0.70;
        this.pulsacao += 0.15;

        if (this.tipo === 'BIGORNA') {
            this.velocidade.y += this.gravidade;
            this.posicao.add(this.velocidade);
            this.posicao.x -= jogo.velocidadeAtual * 0.4; 

            if (this.posicao.y >= this.esteiraY) {
                this.posicao.y = this.esteiraY;
                this.velocidade.y = -this.velocidade.y * 0.65; 
                this.velocidade.y += random(-1.5, 1.5); 
                this.contagemQuiques++;
                
                if (this.contagemQuiques > 3 || abs(this.velocidade.y) < 1.5) {
                    this.velocidade.y = 0;
                    this.gravidade = 0;
                }
            }
        } else {
            this.posicao.x -= jogo.velocidadeAtual;
        }

        if (this.posicao.x < -100 || this.posicao.y > height + 100) {
            this.ativo = false;
        }
    }

    desenhar() {
        push();
        imageMode(CENTER);
        
        let ajustarY = (this.tipo === 'BIGORNA') ? -10 : -15;
        translate(this.posicao.x, this.posicao.y + ajustarY);

        if (this.tipo === 'FRUTA' && this.nomeFruta) {
            let frutaAlvoAtual = (jogo.pedidoAtual && jogo.pedidoAtual.length > 0) ? jogo.pedidoAtual[0] : null;
            // os contornos vao funcionar apenas no modo vitamina, desativando-os por completo no modo sobrevivência
            let deveTerContorno = (jogo.modo === 'VITAMINA' && this.nomeFruta === frutaAlvoAtual);

            if (deveTerContorno) {
                push();
                noFill();
                stroke('#FFF7E8');
                strokeWeight(4 + sin(this.pulsacao) * 2);
                ellipse(0, 0, this.raio * 2.3);
                pop();
            }
            image(imgsFrutas[this.nomeFruta], 0, 0, this.raio * 2, this.raio * 2);
        }
        else if (this.tipo === 'BOMBA') {
            image(imgBomba, 0, 0, this.raio * 2.2, this.raio * 2.2);
        }
        else if (this.tipo === 'BIGORNA') {
            image(imgBigorna, 0, 0, this.raio * 2.2, this.raio * 1.8);
        }
        else if (this.tipo === 'RELOGIO') {
            fill('#FFF7E8'); stroke('#6B4F3A'); strokeWeight(4);
            ellipse(0, 0, 48);
            stroke('#4A3526'); strokeWeight(3); line(0, 0, 0, -15); line(0, 0, 10, 0);
        }
        pop();
    }
}

class MotorJogo {
    constructor() {
        this.estado = 'MENU';
        this.modo = 'VITAMINA';
        this.pontuacao = 0;
        this.combo = 0;
        this.vidas = 5; 
        this.tempoRestante = 88; 
        
        this.velocidadeBase = 5.5;
        this.velocidadeAtual = 5.5;
        this.ganhoExtraMultiplicador = 0; 
        
        this.pinguim = null;
        this.itens = [];
        this.particulas = [];
        this.pedidoAtual = [];
        this.temporizadorSurgimento = 0;
        this.botoes = [];
        this.deslocamentoEsteira = 0; 
    }

    inicializar(modo) {
        this.modo = modo;
        this.pontuacao = 0;
        this.combo = 0;
        this.vidas = 5; 
        this.tempoRestante = 88;
        this.ganhoExtraMultiplicador = 0;
        this.velocidadeAtual = this.velocidadeBase;
        this.itens = [];
        this.particulas = [];
        this.pinguim = new Pinguim(); 
        this.gerarPedido();
        
        let espacamentoSpawn = 190;
        let totalItensIniciais = ceil(width / espacamentoSpawn) + 1;
        
        for (let i = 0; i < totalItensIniciais; i++) {
            let xInicial = 80 + (i * espacamentoSpawn);
            if (xInicial > width + 100) break;

            let item;
            if (this.modo === 'VITAMINA') {
                let alvo = this.pedidoAtual[0];
                let criarCorreta = random(1) < 0.55;
                item = new ItemEsteira('FRUTA', criarCorreta);
                if (criarCorreta && alvo) {
                    item.nomeFruta = alvo;
                }
            } else {
                let aleatorio = random(1);
                if (aleatorio < 0.15) {
                    item = new ItemEsteira('BOMBA', false);
                } else if (aleatorio < 0.30) {
                    item = new ItemEsteira('BIGORNA', false);
                } else {
                    item = new ItemEsteira('FRUTA', false);
                }
            }
            item.posicao.x = xInicial;
            this.itens.push(item);
        }

        this.temporizadorSurgimento = 0;
        this.estado = 'JOGANDO';

        if (musicaJogo && !musicaJogo.isPlaying()) {
            musicaJogo.loop();
            musicaJogo.setVolume(0.4);
        }
    }

    atualizarVelocidadePorCombo() {
        if (this.combo >= 4) {
            let fatorProgresso = (this.combo - 3) * 1.15; 
            this.velocidadeAtual = this.velocidadeBase + fatorProgresso + this.ganhoExtraMultiplicador;
        } else {
            this.velocidadeAtual = this.velocidadeBase + this.ganhoExtraMultiplicador;
        }
    }
    
    gerarPedido() {
        this.pedidoAtual = [];
        let tamanhos = [3, 4, 5];
        let tamanho = random(tamanhos);
        let chaves = Object.keys(MODELOS_FRUTA);
        for (let i = 0; i < tamanho; i++) {
            this.pedidoAtual.push(random(chaves));
        }
    }

    gerenciadorSurgimento() {
        let aleatorio = random(1);
        if (this.modo === 'VITAMINA') {
            if (aleatorio < 0.10 && this.combo >= 5) {
                let relogio = new ItemEsteira('RELOGIO', false);
                this.itens.push(relogio);
            } else {
                let alvo = this.pedidoAtual[0];
                let criarCorreta = random(1) < 0.55;
                let fruta = new ItemEsteira('FRUTA', criarCorreta);
                if (criarCorreta && alvo) {
                    fruta.nomeFruta = alvo;
                }
                this.itens.push(fruta);
            }
        } else {
            if (aleatorio < 0.20) {
                let bomba = new ItemEsteira('BOMBA', false);
                this.itens.push(bomba);
            } else if (aleatorio < 0.45) {
                let bigorna = new ItemEsteira('BIGORNA', false);
                this.itens.push(bigorna);
            } else {
                let frutaSobrevivencia = new ItemEsteira('FRUTA', false);
                this.itens.push(frutaSobrevivencia);
            }
        }
    }

    atualizar() {
        if (this.estado !== 'JOGANDO') return;

        this.pinguim.atualizar();
        
        this.deslocamentoEsteira = (this.deslocamentoEsteira + this.velocidadeAtual) % 40;

        if (this.modo === 'VITAMINA' && frameCount % 60 === 0) {
            this.tempoRestante--;
            if (this.tempoRestante <= 0) { this.estado = 'FIM_DE_JOGO'; }
        }

        this.temporizadorSurgimento++;
        let taxaSurgimentoAtual = max(45 - floor(this.velocidadeAtual * 2), 16);
        if (this.temporizadorSurgimento > taxaSurgimentoAtual) {
            this.temporizadorSurgimento = 0;
            this.gerenciadorSurgimento();
        }

        for (let i = this.particulas.length - 1; i >= 0; i--) {
            this.particulas[i].atualizar();
            if (this.particulas[i].alfa <= 0) { this.particulas.splice(i, 1); }
        }

        let colidiuComItemNesseFrame = false;

        for (let i = this.itens.length - 1; i >= 0; i--) {
            let item = this.itens[i];
            item.atualizar();

            if (!item.ativo) {
                this.itens.splice(i, 1);
                continue;
            }

            let ajustarY = (item.tipo === 'BIGORNA') ? -10 : -15;
            let d = dist(this.pinguim.posicao.x, this.pinguim.posicao.y - (this.pinguim.altura / 2), item.posicao.x, item.posicao.y + ajustarY);
            
            if (d < (item.raio + this.pinguim.raioHitbox)) {
                this.dispararColisao(item);
                this.itens.splice(i, 1);
                colidiuComItemNesseFrame = true; 
            }
        }

        if (!colidiuComItemNesseFrame && this.pinguim.posicao.y >= this.pinguim.esteiraY) {
            this.pinguim.forcarQuiqueEsteira();
            this.lidarFalhaChao();
        }
    }

    lidarFalhaChao() {
        this.combo = 0;
        this.ganhoExtraMultiplicador = 0; 
        this.atualizarVelocidadePorCombo(); 
        
        this.vidas--;
        if (this.vidas <= 0) { 
            this.estado = 'FIM_DE_JOGO'; 
        }
    }

    dispararColisao(item) {
        if (item.tipo === 'FRUTA') {
            let informacao = MODELOS_FRUTA[item.nomeFruta];
            let ajustarY = -15;
            for (let p = 0; p < 18; p++) {
                this.particulas.push(new ParticulaSuco(item.posicao.x, item.posicao.y + ajustarY, informacao.cor));
            }

            this.pinguim.pular(); 

            if (this.modo === 'VITAMINA') {
                if (item.nomeFruta === this.pedidoAtual[0]) {
                    this.combo++;
                    
                    if (this.combo % 5 === 0) {
                        this.ganhoExtraMultiplicador += 2.0;
                    }
                    
                    this.atualizarVelocidadePorCombo();
                    this.pontuacao += min(this.combo, 5) * 10;
                    this.pedidoAtual.shift();
                    
                    if (this.pedidoAtual.length === 0) {
                        this.pontuacao += 100; 
                        this.gerarPedido();
                    }
                } else {
                    this.combo = 0;
                    this.ganhoExtraMultiplicador = 0; 
                    this.atualizarVelocidadePorCombo();
                    this.pinguim.temporizadorAtordoado = 25; 
                    this.pinguim.tipoErroAtual = "FRUTA_ERRADA";
                    this.vidas--;
                    if (this.vidas <= 0) { this.estado = 'FIM_DE_JOGO'; }
                }
            } else {
                this.combo++;
                
                if (this.combo % 5 === 0) {
                    this.ganhoExtraMultiplicador += 2.0;
                }
                
                this.atualizarVelocidadePorCombo();
                this.pontuacao += min(this.combo, 5) * 10;
                if (this.combo % 4 === 0 && this.vidas < 5) { this.vidas++; }
            }
        } 
        else if (item.tipo === 'BOMBA' || item.tipo === 'BIGORNA') {
            this.combo = 0;
            this.ganhoExtraMultiplicador = 0; 
            this.atualizarVelocidadePorCombo();
            this.pinguim.temporizadorAtordoado = 40;
            this.pinguim.tipoErroAtual = "OBSTACULO";
            this.pinguim.velocidade.y = -8; 

            this.vidas--;
            if (this.vidas <= 0) { 
                this.estado = 'FIM_DE_JOGO'; 
            }
        } 
        else if (item.tipo === 'RELOGIO') {
            this.tempoRestante += 10;
            this.pinguim.pular(); 
        }
    }

    renderizar() {
        if (imgWallpaper) {
            push();
            imageMode(CENTER);
            let escala = max(width / imgWallpaper.width, height / imgWallpaper.height);
            image(imgWallpaper, width / 2, height / 2, imgWallpaper.width * escala, imgWallpaper.height * escala);
            pop();
        } else {
            background('#d35400');
        }

        this.desenharEsteiraRealista();

        if (this.estado === 'JOGANDO') {
            this.itens.forEach(item => item.desenhar());
            this.pinguim.desenhar();
            this.particulas.forEach(p => p.desenhar());
            this.desenharInterface();
        } else if (this.estado === 'MENU') { this.renderizarMenu(); }
        else if (this.estado === 'SOBRE') { this.renderizarSobre(); }
        else if (this.estado === 'FIM_DE_JOGO') { this.renderizarFimJogo(); }
    }

    desenharEsteiraRealista() {
        let eY = height * 0.70;
        push();
        rectMode(CORNER);
        
        fill('#2c3e50'); stroke('#1a252f'); strokeWeight(3);
        rect(-10, eY - 4, width + 20, 38, 6);
        
        fill('#242424'); noStroke();
        rect(0, eY, width, 25);
        
        stroke('#3a3a3a'); strokeWeight(4);
        for (let x = -40; x < width + 40; x += 40) {
            let posX = x - this.deslocamentoEsteira;
            line(posX, eY, posX, eY + 24);
        }
        
        fill('#7f8c8d'); stroke('#95a5a6'); strokeWeight(2);
        rect(-10, eY + 20, width + 20, 10);
        fill('#bdc3c7'); noStroke();
        rect(-10, eY + 20, width + 20, 3);
        
        fill('#7f8c8d'); stroke('#34495e'); strokeWeight(1);
        for (let r = 20; r < width; r += 160) {
            ellipse(r, eY + 25, 6, 6);
        }
        pop();
    }

    desenharInterface() {
        push();
        translate(width / 2, 60);
        rectMode(CENTER); stroke('#6B4F3A'); strokeWeight(5); fill('#FFF7E8'); rect(0, 0, 180, 60, 10);
        let m = floor(this.tempoRestante / 60); let s = this.tempoRestante % 60;
        let textoRelogio = this.modo === 'VITAMINA' ? `${m}:${s < 10 ? '0' : ''}${s}` : "∞";
        desenharTexto(textoRelogio, 0, 2, 34);
        pop();

        let painelY = height - 140;
        push(); translate(width - 280, painelY);
        noFill(); stroke('#4A3526'); strokeWeight(20); arc(100, 50, 130, 130, PI, TWO_PI);
        stroke('#e67e22');
        arc(100, 50, 130, 130, PI, PI + (TWO_PI - PI) * (min(this.combo, 5) / 5));
        pop();
        desenharTexto(`${this.combo}x`, width - 180, painelY + 45, 28);

        push();
        rectMode(CORNER); fill('#6B4F3A'); stroke('#4A3526'); strokeWeight(3); rect(40, height - 115, 260, 70, 8);
        pop();
        desenharTexto(`PONTOS: ${this.pontuacao}`, 170, height - 80, 28);

        // corações2, vou ajustar mais tarde pq fiz a funçao
        for (let i = 0; i < 5; i++) {
            if (i < this.vidas) {
                fill('#ff2a4b'); 
            } else {
                fill('#6B4F3A'); 
            }
            stroke('#4A3526'); 
            strokeWeight(2.5);
            desenharCoracao(55 + (i * 38), 46, 24);
        }

        if (this.modo === 'VITAMINA' && this.pedidoAtual.length > 0) {
            let larguraBandeja = this.pedidoAtual.length * 115 + 60;
            let bandejaX = width / 2 - larguraBandeja / 2;
            push();
            fill('#FFF7E8'); stroke('#6B4F3A'); strokeWeight(5); rect(bandejaX, height - 165, larguraBandeja, 135, 12);
            pop();

            for (let i = 0; i < this.pedidoAtual.length; i++) {
                let nomeF = this.pedidoAtual[i];
                let cartaoX = bandejaX + 65 + (i * 115);
                let cartaoY = height - 98;

                push();
                imageMode(CENTER);
                if (i === 0) {
                    stroke('#e67e22'); strokeWeight(4); fill('#FFF7E8');
                    rectMode(CENTER); rect(cartaoX, cartaoY - 8, 95, 100, 8); 
                    image(imgsFrutas[nomeF], cartaoX, cartaoY - 8, 74, 74);
                } else {
                    stroke('#6B4F3A'); strokeWeight(2); fill('#FFF7E8');
                    rectMode(CENTER); rect(cartaoX, cartaoY, 82, 85, 8);
                    image(imgsFrutas[nomeF], cartaoX, cartaoY, 58, 58);
                }
                pop();
            }
        }

        if (this.pinguim.temporizadorAtordoado > 0) {
            let msg = "RECEITA INCORRETA!";
            if (this.pinguim.tipoErroAtual === "ESTEIRA") msg = "CUIDADO COM A ESTEIRA!";
            else if (this.pinguim.tipoErroAtual === "OBSTACULO") msg = "CUIDADO COM OS OBSTÁCULOS!";
            else if (this.pinguim.tipoErroAtual === "FRUTA_ERRADA") msg = "FRUTA ERRADA!";
            
            push();
            fill('rgba(74, 53, 38, 0.9)'); 
            rectMode(CENTER);
            rect(width / 2, 140, width * 0.5, 60, 10);
            pop();
            desenharTexto(msg, width / 2, 140, 30);
        }
    }

    renderizarMenu() {
        push();
        fill('rgba(74, 53, 38, 0.6)'); rect(0, 0, width, height);
        pop();
        
        desenharTexto("Esmaga Fruta", width / 2, height * 0.20, 84);
        desenharTexto("PjBL 2 - Web Development: Canvas & Games", width / 2, height * 0.30, 26);

        // botões principais e tamanhos
        this.botoes = [
            { id: 'VITAMINA', texto: 'Modo Vitamina (Smoothies)', x: width/2 - 290, y: height*0.42, w: 580, h: 86 },
            { id: 'SOBREVIVENCIA', texto: 'Modo Frutada (Sobrevivência)', x: width/2 - 290, y: height*0.56, w: 580, h: 86 },
            { id: 'SOBRE', texto: 'Regras', x: width/2 - 290, y: height*0.70, w: 580, h: 86 }
        ];
        this.desenharBotoesInterface();
    }

    renderizarSobre() {
        push();
        fill('rgba(42, 29, 20, 0.95)'); rect(0, 0, width, height);
        pop();
        
        desenharTexto("MANUAL DO ESMAGA FRUTA", width / 2, height * 0.14, 48);
        
        let linhas = [
            "Controles do Pinguim:",
            "• [Seta para Cima / W]: Planar suavemente no ar",
            "• [Seta para Baixo / S]: Queda rápida estratégica",
            "• [Setas Laterais / A, D]: Movimentação horizontal",
            "Atenção: Use as frutas como plataformas seguras de rebatimento!",
            "",
            "Tocar diretamente na esteira zera seu combo atual e faz você perder vida.",
            "Evite as bombas e bigornas a todo custo, elas causam atordoamento e perda de vida.",
            "No modo Vitamina, siga a receita exibida na bandeja inferior para ganhar pontos e aumentar seu combo.",
            "No modo Frutada, sobreviva o máximo possível acumulando pontos e combos, sem um pedido específico.",
            "",
            "Desenvolvido por Julia Ferreira Padilha :)"
        ];
        
        for (let i = 0; i < linhas.length; i++) {
            desenharTexto(linhas[i], width / 2, height * 0.26 + (i * 44), 26);
        }

        // botão de voltar reduzido mantendo a devida proporção
        this.botoes = [ { id: 'VOLTAR', texto: 'Voltar ao Menu', x: width/2 - 232, y: height*0.84, w: 464, h: 81 } ];
        this.desenharBotoesInterface();
    }

    renderizarFimJogo() {
        push();
        fill('rgba(42, 29, 20, 0.9)'); rect(0, 0, width, height);
        pop();
        
        desenharTexto("TURNO ENCERRADO!", width / 2, height * 0.35, 74);
        desenharTexto("Pontos Conquistados: " + this.pontuacao, width / 2, height * 0.48, 38);

        // botão de fim de jogo
        this.botoes = [ { id: 'VOLTAR', texto: 'Voltar ao Menu', x: width/2 - 260, y: height*0.65, w: 520, h: 86 } ];
        this.desenharBotoesInterface();
    }

    desenharBotoesInterface() {
        push();
        imageMode(CORNER);
        for (let i = 0; i < this.botoes.length; i++) {
            let b = this.botoes[i];
            let focoMouse = (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h);
            
            if (focoMouse && tint) {
                tint(240, 220, 200); 
            } else if (tint) {
                noTint();
            }
            
            image(imgBotao, b.x, b.y, b.w, b.h);
            desenharTexto(b.texto, b.x + b.w / 2, b.y + b.h / 2, 24);
        }
        pop();
    }

    lidarCliqueMouse() {
        for (let i = 0; i < this.botoes.length; i++) {
            let b = this.botoes[i];
            if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
                if (b.id === 'VITAMINA') this.inicializar('VITAMINA');
                else if (b.id === 'SOBREVIVENCIA') this.inicializar('SOBREVIVENCIA');
                else if (b.id === 'SOBRE') this.estado = 'SOBRE';
                else if (b.id === 'VOLTAR') this.estado = 'MENU';
            }
        }
    }
}