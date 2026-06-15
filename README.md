# 🍓 Esmaga Fruta 🐧

Um jogo arcade divertido desenvolvido em JavaScript utilizando a biblioteca **p5.js**. O objetivo é pisotear frutas que viajam por uma esteira industrial, enquanto desvia de obstáculos e gerencia o tempo para pontuar (e claro: fazer seus smoothies)!

Este projeto foi desenvolvido como parte do **PjBL 2 - Web Development: Canvas & Games** do 3º período de Sistemas de Informação.

---

## 🎮 Como Jogar

O jogo conta com mecânicas de física baseadas em rebatimento. As frutas funcionam como plataformas seguras: ao encostar nelas, o pinguim pega impulso automaticamente.

### Controles:
* **`Seta para Esquerda` / `A`**: Move o pinguim para a esquerda.
* **`Seta para Direita` / `D`**: Move o pinguim para a direita.
* **`Seta para Cima` / `W`**: Ativa o modo planar (reduz a gravidade, permitindo flutuar suavemente).
* **`Seta para Baixo` / `S`**: Força uma queda rápida estratégica para atingir alvos com precisão.

### ⚠️ Perigos na Pista:
* **Tocar na Esteira**: Se você errar o pulo e cair direto na esteira envenenada, seu combo é zerado e você perde 1 vida.
* **Bombas e Bigornas**: Obstáculos traiçoeiros que caem ou correm pela esteira. Tocá-los causa atordoamento imediato e perda de vida.

---

## 🕹️ Modos de Jogo

O jogo possui dois modos distintos selecionáveis no menu principal:

### 1. Modo Vitamina (Smoothies)
O modo estratégico do jogo. Uma bandeja na parte inferior da tela exibe uma "receita" (sequência de frutas) que deve ser coletada exatamente na ordem. 
* Esmagar a fruta certa mantém e aumenta seu **Combo**.
* Esmagar a fruta errada quebra o combo e tira uma vida.
* Fique de olho nos **Relógios** que surgem na esteira para ganhar +10 segundos de tempo extra!

### 2. Modo Frutada (Sobrevivência)
O modo arcade puro. Não há receita ou ordem certa para coletar. O seu objetivo é esmagar o máximo de frutas que conseguir para manter o multiplicador de pontos alto e sobreviver às ondas cada vez mais rápidas de bombas e bigornas.

---

## 🛠️ Tecnologias Utilizadas

* **JavaScript (ES6+)**
* **p5.js** (Biblioteca para computação gráfica e interatividade)
* **p5.sound** (Add-on para gerenciamento e reprodução da trilha sonora)
* **HTML5 & CSS3**

---

## 📁 Estrutura de Arquivos

```text
esmaga-fruta/
├── index.html          # Estrutura HTML e importação das bibliotecas (p5.js)
├── script.js           # Toda a lógica do jogo (Motor, Pinguim, Itens, Partículas)
└── src/                # Pasta de assets (Imagens e Sons)
    ├── pinguim.png
    ├── wallpaper.png
    ├── botao_base.png
    ├── bomba.png
    ├── bigorna.png
    ├── morango.png
    ├── banana.png
    ├── uva.png
    ├── laranja.png
    ├── maca.png
    └── musica.mp3