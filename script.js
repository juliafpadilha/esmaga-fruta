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

// --- classe dos itens da esteira (frutas grandes e bigornas com fisica) ---
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
            this.raio = MODELOS_FRUTA[item.nomeFruta]?.raio || 32; // gambiarra pro jogo nao travar se nao tiver o modelo da fruta
            if (MODELOS_FRUTA[this.nomeFruta]) this.raio = MODELOS_FRUTA[this.nomeFruta].raio;
        } else {
            this.raio = 32;
        }

        this.esteiraY = height * 0.52;
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

        let colidiuComItemNesseFrame = false;

        for (let i = this.itens.length - 1; i >= 0; i--) {
            let item = this.itens[i];
            item.atualizar();

            if (!item.ativo) {
                this.itens.splice(i, 1);
                continue;
            }

            let d = dist(this.pinguim.posicao.x, this.pinguim.posicao.y - 35, item.posicao.x, item.posicao.y - 15);
            
            if (d < (item.raio + 35)) {
                this.dispararColisao(item);
                this.itens.splice(i, 1);
                colidiuComItemNesseFrame = true; 
            }
        }

        if (!colidiuComItemNesseFrame && this.pinguim.posicao.y >= this.pinguim.esteiraY) {
            this.pinguim.forçarQuiqueEsteira();
            this.lidarFalhaChao();
        }
    }

    desenhar() {
        push();
        translate(this.posicao.x, this.posicao.y);
        stroke('#10141d');
        strokeWeight(4);

        if (this.tipo === 'FRUTA' && this.nomeFruta) {
            let informacao = MODELOS_FRUTA[this.nomeFruta];
            
            if (this.ehAlvo) {
                push();
                noFill();
                stroke(255);
                strokeWeight(6 + sin(this.pulsacao) * 3);
                ellipse(0, -this.raio/2, this.raio * 2.3);
                pop();
            }

            fill(informacao.cor);
            if (informacao.tipo === 'morango') {
                triangle(-this.raio, -this.raio*1.2, this.raio, -this.raio*1.2, 0, 5);
                fill(informacao.corFolha); ellipse(0, -this.raio*1.2, this.raio*1.2, 12);
            } else if (informacao.tipo === 'banana') {
                arc(0, -this.raio/2, this.raio * 2, this.raio * 1.3, 0, PI, OPEN);
            } else if (informacao.tipo === 'uva') {
                ellipse(-10, -18, 22); ellipse(10, -18, 22);
                ellipse(0, -10, 24);  ellipse(0, 0, 20);
            } else {
                ellipse(0, -this.raio/2, this.raio * 2, this.raio * 1.9);
                fill(informacao.corFolha); rect(-3, -this.raio - 8, 6, 10);
            }
        }
        else if (this.tipo === 'BOMBA') {
            fill('#222222'); ellipse(0, -20, 56);
            fill('#e74c3c'); rect(-5, -50, 10, 6);
            stroke('#f1c40f'); strokeWeight(3); line(0, -50, 12, -62);
        }
        else if (this.tipo === 'BIGORNA') {
            fill('#555555');
            rectMode(CENTER);
            rect(0, 0, 75, 28, 4);
            quad(-30, -14, 30, -14, 20, -40, -20, -40);
            rect(0, -45, 90, 18, 2);
        }
        else if (this.tipo === 'RELOGIO') {
            fill('#ffffff'); stroke('#f1c40f'); strokeWeight(5);
            ellipse(0, -25, 48);
            stroke(0); strokeWeight(2.5); line(0, -25, 0, -40); line(0, -25, 10, -25);
        }
        pop();
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

    lidarFalhaChao() {
        this.combo = 0;
        this.atualizarVelocidadePorCombo(); 
        
        if (this.modo === 'SOBREVIVENCIA') {
            this.vidas--;
            if (this.vidas <= 0) { this.estado = 'FIM_DE_JOGO'; }
        } else {
            this.tempoRestante = max(0, this.tempoRestante - 15); 
        }
    }

    dispararColisao(item) {
        if (item.tipo === 'FRUTA') {
            let informacao = MODELOS_FRUTA[item.nomeFruta];
            
            for (let p = 0; p < 18; p++) {
                this.particulas.push(new ParticulaSuco(item.posicao.x, item.posicao.y - 15, informacao.cor));
            }

            this.pinguim.pular(); 

            if (this.modo === 'VITAMINA') {
                if (item.nomeFruta === this.pedidoAtual[0]) {
                    this.combo++;
                    this.atualizarVelocidadePorCombo();
                    this.pontuacao += min(this.combo, 5) * 10;
                    this.pedidoAtual.shift();
                    
                    if (this.pedidoAtual.length === 0) {
                        this.pontuacao += 100; 
                        this.gerarPedido();
                    }
                } else {
                    this.combo = 0;
                    this.atualizarVelocidadePorCombo();
                    this.pinguim.temporizadorAtordoado = 25; 
                    this.pinguim.tipoErroAtual = "FRUTA_ERRADA";
                }
            } else {
                this.combo++;
                this.atualizarVelocidadePorCombo();
                this.pontuacao += min(this.combo, 5) * 10;
                if (this.combo % 4 === 0 && this.vidas < 5) { this.vidas++; }
            }
        } 
        else if (item.tipo === 'BOMBA' || item.tipo === 'BIGORNA') {
            this.combo = 0;
            this.atualizarVelocidadePorCombo();
            this.pinguim.temporizadorAtordoado = 40;
            this.pinguim.tipoErroAtual = "OBSTACULO";
            this.pinguim.velocidade.y = -8; 

            if (this.modo === 'SOBREVIVENCIA') {
                this.vidas--;
                if (this.vidas <= 0) { this.estado = 'FIM_DE_JOGO'; }
            } else {
                this.tempoRestante = max(0, this.tempoRestante - 10);
            }
        } 
        else if (item.tipo === 'RELOGIO') {
            this.tempoRestante += 10;
            this.pinguim.pular(); 
        }
    }

    renderizar() {
        background('#d35400');
        fill('#ba4a00'); noStroke(); rect(0, height * 0.4, width, height * 0.6);
        stroke('#a04000'); strokeWeight(4);
        for (let x = 40; x < width; x += 120) { line(x, 0, x, height * 0.4); }

        stroke('#10141d'); strokeWeight(5); fill('#2980b9');
        rect(-10, -10, 75, height * 0.35, 0, 0, 15, 0); 
        fill('#3498db'); rect(width - 65, -10, 75, height * 0.35, 0, 0, 0, 15);

        stroke('#2c3e50'); strokeWeight(2); line(width*0.2, 0, width*0.2, 50); line(width*0.8, 0, width*0.8, 50);
        stroke('#10141d'); strokeWeight(4); fill('#f39c12'); ellipse(width*0.2, 75, 45, 45); ellipse(width*0.8, 75, 45, 45);

        rectMode(CORNER);
        fill('#4b5563'); stroke('#10141d'); strokeWeight(6);
        rect(-10, height * 0.52, width + 20, 45); 
        fill('#1f2937'); noStroke();
        rect(0, height * 0.53, width, 30);
        
        stroke('#374151'); strokeWeight(6);
        let deslocamentoX = (millis() * (this.velocidadeAtual / 15)) % 60;
        for (let x = width + 60 - deslocamentoX; x > -60; x -= 60) {
            line(x, height * 0.53, x - 15, height * 0.57);
        }

        this.desenharCesta(95, height * 0.48);
        this.desenharCesta(width - 130, height * 0.48);

        if (this.estado === 'JOGANDO') {
            this.itens.forEach(item => item.desenhar());
            this.pinguim.desenhar();
            this.particulas.forEach(p => p.desenhar());
            this.desenharInterface();
        } else if (this.estado === 'MENU') { this.renderizarMenu(); }
        else if (this.estado === 'SOBRE') { this.renderizarSobre(); }
        else if (this.estado === 'FIM_DE_JOGO') { this.renderizarFimJogo(); }
    }

    desenharCesta(x, y) {
        push(); translate(x, y); stroke('#10141d'); strokeWeight(3.5); fill('#d35400'); ellipse(0, -25, 50, 20);
        fill('#e67e22'); arc(0, -10, 60, 40, 0, PI, CHORD); pop();
    }

    desenharInterface() {
        push();
        translate(width / 2, 60);
        rectMode(CENTER); stroke('#4a2711'); strokeWeight(6); fill('#874c24'); rect(0, 0, 160, 65, 10);
        stroke('#10141d'); strokeWeight(3); fill('#f5f6fa'); rect(0, 0, 140, 48, 6);
        
        let m = floor(this.tempoRestante / 60); let s = this.tempoRestante % 60;
        let textoRelogio = this.modo === 'VITAMINA' ? `${m}:${s < 10 ? '0' : ''}${s}` : "∞";
        fill('#2f3640'); textStyle(BOLD); textSize(26); textAlign(CENTER, CENTER);
        text(textoRelogio, 0, 2);
        pop();

        let painelY = height - 100;
        push(); translate(width - 240, painelY);
        noFill(); stroke('#1f2937'); strokeWeight(20); arc(100, 50, 120, 120, PI, TWO_PI);
        let cores = ['#2ecc71', '#2ecc71', '#f1c40f', '#f39c12', '#e67e22', '#e74c3c'];
        stroke(cores[min(this.combo, 5)]);
        arc(100, 50, 120, 120, PI, PI + (TWO_PI - PI) * (min(this.combo, 5) / 5));
        rectMode(CENTER); noStroke(); fill('#10141d'); rect(100, 50, 40, 30, 4);
        fill(255); textSize(16); textAlign(CENTER, CENTER); text(`${this.combo}x`, 100, 50);
        pop();

        fill('#5c3a21'); stroke('#10141d'); strokeWeight(4); rect(40, height - 85, 180, 55, 8);
        fill(255); noStroke(); textSize(18); textAlign(CENTER, CENTER); text(`PONTOS: ${this.pontuacao}`, 130, height - 58);

        if (this.modo === 'SOBREVIVENCIA') {
            for (let i = 0; i < 5; i++) {
                fill(i < this.vidas ? '#e74c3c' : '#bdc3c7');
                ellipse(45 + (i * 26), 40, 18, 18);
            }
        }

        if (this.modo === 'VITAMINA' && this.pedidoAtual.length > 0) {
            let larguraBandeja = this.pedidoAtual.length * 65 + 40;
            let bandejaX = width / 2 - larguraBandeja / 2;
            fill('#eed9c4'); stroke('#5c3a21'); strokeWeight(5); rect(bandejaX, height - 95, larguraBandeja, 75, 12);

            for (let i = 0; i < this.pedidoAtual.length; i++) {
                let nomeF = this.pedidoAtual[i];
                let cartaoX = bandejaX + 35 + (i * 65);
                let cartaoY = height - 58;

                if (i === 0) {
                    stroke('#f1c40f'); strokeWeight(4); fill('#ffffff');
                    rectMode(CENTER); rect(cartaoX, cartaoY - 10, 52, 58, 5); 
                } else {
                    stroke('#10141d'); strokeWeight(2); fill('#f5f6fa');
                    rectMode(CENTER); rect(cartaoX, cartaoY, 46, 50, 5);
                }
                noStroke(); fill(MODELOS_FRUTA[nomeF].cor);
                ellipse(cartaoX, i === 0 ? cartaoY - 10 : cartaoY, 26);
            }
        }

        if (this.pinguim.temporizadorAtordoado > 0) {
            let msg = "ERRO DE RECEITA! FRUTA ERRADA!";
            let corPainel = 'rgba(231, 76, 60, 0.85)';
            
            if (this.pinguim.tipoErroAtual === "ESTEIRA") {
                msg = "QUEDA DA ESTEIRA! RESET DE COMBO!";
                corPainel = 'rgba(192, 57, 43, 0.9)';
            } else if (this.pinguim.tipoErroAtual === "OBSTACULO") {
                msg = "CUIDADO COM OS OBSTÁCULOS!";
                corPainel = 'rgba(211, 84, 0, 0.85)';
            }
            
            fill(corPainel); rect(0, height / 2 - 40, width, 80);
            fill('#ffffff'); textSize(28); textAlign(CENTER, CENTER); textStyle(BOLD);
            text(msg, width / 2, height / 2);
        }
    }

    renderizarMenu() {
        fill('rgba(16, 20, 29, 0.8)'); rect(0, 0, width, height);
        textAlign(CENTER, CENTER); textStyle(BOLD); fill('#f1c40f'); textSize(60);
        text("ESMAGA FRUTA", width / 2, height * 0.25);
        fill(255); textSize(18); textStyle(ITALIC); text("Regras Avançadas: O chão é lava! Use as frutas como plataformas.", width / 2, height * 0.33);

        this.botoes = [
            { id: 'VITAMINA', texto: 'Modo Vitamina (Smoothies)', x: width/2 - 175, y: height*0.46, w: 350, h: 55 },
            { id: 'SOBREVIVENCIA', texto: 'Modo Frutada (Sobrevivência)', x: width/2 - 175, y: height*0.58, w: 350, h: 55 },
            { id: 'SOBRE', texto: 'Créditos / Integrantes', x: width/2 - 175, y: height*0.70, w: 350, h: 55 }
        ];
        this.desenharBotoesInterface();
    }

    renderizarSobre() {
        fill('rgba(16, 20, 29, 0.92)'); rect(0, 0, width, height);
        textAlign(CENTER, CENTER); fill(255); textSize(32); textStyle(BOLD);
        text("REGRAS DA FÁBRICA DE SMOOTHIES", width / 2, height * 0.16);
        textSize(18); textStyle(NORMAL);
        
        let linhas = [
            "Controles e Mecânicas:",
            "• [Seta para Cima / W]: Segure no ar para planar",
            "• [Seta para Baixo / S]: Pressione no ar para descer com velocidade",
            "• [Setas Laterais / A, D]: Movimentação horizontal",
            "PROIBIDO TOCAR NA ESTEIRA! Pular diretamente nela reseta combo e tira vida.",
            "Apenas frutas servem como plataformas seguras de rebatimento automático!",
            "",
            "Esmaga Fruta - Feito por:",
            "Julia Ferreira Padilha :)"
        ];
        
        for (let i = 0; i < linhas.length; i++) {
            let l = linhas[i];
            if (l.indexOf("PROIBIDO") !== -1) { fill('#e74c3c'); }
            else if (l.indexOf("•") !== -1) { fill('#f1c40f'); }
            else { fill(255); }
            text(l, width / 2, height * 0.28 + (i * 32));
        }

        this.botoes = [ { id: 'VOLTAR', texto: 'Voltar ao Menu', x: width/2 - 125, y: height*0.82, w: 250, h: 50 } ];
        this.desenharBotoesInterface();
    }

    renderizarFimJogo() {
        fill('rgba(0, 0, 0, 0.9)'); rect(0, 0, width, height);
        textAlign(CENTER, CENTER); fill('#e74c3c'); textSize(60); textStyle(BOLD);
        text("TURNO ENCERRADO!", width / 2, height * 0.35);
        fill(255); textSize(24); textStyle(NORMAL); text("Pontos Finais Totais: " + this.pontuacao, width / 2, height * 0.48);

        this.botoes = [ { id: 'VOLTAR', texto: 'Voltar ao Menu Principal', x: width/2 - 150, y: height*0.65, w: 300, h: 55 } ];
        this.desenharBotoesInterface();
    }

    desenharBotoesInterface() {
        rectMode(CORNER); textStyle(BOLD); textSize(18);
        for (let i = 0; i < this.botoes.length; i++) {
            let b = this.botoes[i];
            let focoMouse = (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h);
            stroke('#ffffff'); strokeWeight(2.5); 
            if (focoMouse) { fill('#e67e22'); } else { fill('#d35400'); }
            rect(b.x, b.y, b.w, b.h, 8); noStroke(); fill(255); text(b.texto, b.x + b.w / 2, b.y + b.h / 2);
        }
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