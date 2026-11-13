import { useEffect, useRef } from "react";

//tamanho de cada quadradinho e o espaço entre eles, em pixels
const LADO = 44;
const FOLGA = 3;

//distância em que o mouse ainda levanta os quadrados
const RAIO = 150;

//quanto menor, mais devagar o quadrado desce depois que o mouse sai (é isso que cria o rastro)
const SUAVIDADE = 0.12;

//cores da paleta em rgb
const ROXO_MEDIO = [95, 45, 145];
const PRIMARIA = [152, 51, 175];

//mistura duas cores: t = 0 devolve a primeira, t = 1 devolve a segunda
function misturar(a, b, t) {
  return a.map((valor, i) => Math.round(valor + (b[i] - valor) * t));
}

//fundo de quadradinhos que sobem em alto relevo quando o mouse passa perto
//usamos canvas em vez de uma div por quadrado porque são centenas de quadrados e o canvas desenha tudo de uma vez
function FundoQuadrados() {
  //o useRef guarda o elemento canvas sem redesenhar a tela quando ele muda
  const canvasRef = useRef(null);

  //o useEffect roda depois que o canvas já existe na página (antes disso ele seria null)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pai = canvas.parentElement;

    //quem pediu menos animação no sistema recebe só o fundo parado
    const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let largura = 0;
    let altura = 0;
    let colunas = 0;
    let linhas = 0;
    //niveis guarda o quanto cada quadrado está levantado agora (0 = no chão, 1 = no máximo)
    let niveis = new Float32Array(0);
    //tons dá a cada quadrado um brilho um pouco diferente, para o fundo parecer pixelado e não chapado
    let tons = new Float32Array(0);
    let mouse = { x: -9999, y: -9999 };
    let animando = false;
    let quadro = 0;

    function ajustarTamanho() {
      //telas de alta densidade têm mais pixels que o tamanho em CSS; sem isso o desenho fica borrado
      const dpr = window.devicePixelRatio || 1;
      largura = pai.clientWidth;
      altura = pai.clientHeight;
      canvas.width = largura * dpr;
      canvas.height = altura * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      colunas = Math.ceil(largura / LADO);
      linhas = Math.ceil(altura / LADO);
      niveis = new Float32Array(colunas * linhas);

      //conta fixa: os tons não mudam toda vez que a janela é redimensionada
      tons = Float32Array.from({ length: colunas * linhas }, (_, i) =>
        Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1
      );

      desenhar();
    }

    //desenha um quadrado; nivel > 0 aplica o efeito de relevo
    function desenharQuadrado(c, l, i) {
      const nivel = niveis[i];
      const x = c * LADO + FOLGA / 2;
      const y = l * LADO + FOLGA / 2;
      const lado = LADO - FOLGA;

      if (nivel === 0) {
        //o topo da tela é mais claro que a base, igual nas referências de quadrados em degradê
        const claridadeVertical = 1 - y / altura;
        const alfa = 0.1 + tons[i] * 0.16 + claridadeVertical * 0.1;
        ctx.fillStyle = `rgba(${ROXO_MEDIO.join(",")}, ${alfa})`;
        ctx.fillRect(x, y, lado, lado);
        return;
      }

      //o quadrado cresce um pouco e ganha sombra: é isso que dá a sensação de que ele subiu
      const crescer = nivel * 9;
      const px = x - crescer / 2;
      const py = y - crescer / 2;
      const tam = lado + crescer;
      const [r, g, b] = misturar(ROXO_MEDIO, PRIMARIA, nivel);

      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 20 * nivel;
      ctx.shadowOffsetY = 9 * nivel;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.35 + nivel * 0.65})`;
      ctx.fillRect(px, py, tam, tam);
      ctx.restore();

      //luz vindo de cima à esquerda: bordas claras em cima/esquerda e escuras embaixo/direita completam o relevo
      ctx.fillStyle = `rgba(230, 198, 219, ${0.75 * nivel})`;
      ctx.fillRect(px, py, tam, 1.5);
      ctx.fillRect(px, py, 1.5, tam);
      ctx.fillStyle = `rgba(25, 0, 25, ${0.5 * nivel})`;
      ctx.fillRect(px, py + tam - 1.5, tam, 1.5);
      ctx.fillRect(px + tam - 1.5, py, 1.5, tam);
    }

    function desenhar() {
      ctx.clearRect(0, 0, largura, altura);

      //primeiro desenhamos os quadrados no chão e guardamos os levantados para depois
      //assim os levantados ficam por cima dos vizinhos, e não escondidos atrás deles
      const levantados = [];
      for (let l = 0; l < linhas; l++) {
        for (let c = 0; c < colunas; c++) {
          const i = l * colunas + c;
          if (niveis[i] === 0) desenharQuadrado(c, l, i);
          else levantados.push([c, l, i]);
        }
      }

      for (const [c, l, i] of levantados) desenharQuadrado(c, l, i);
    }

    //roda a cada quadro da animação: aproxima cada quadrado do nível que ele deveria ter
    function atualizar() {
      let mexendo = false;

      for (let l = 0; l < linhas; l++) {
        for (let c = 0; c < colunas; c++) {
          const i = l * colunas + c;
          const distancia = Math.hypot(
            c * LADO + LADO / 2 - mouse.x,
            l * LADO + LADO / 2 - mouse.y
          );

          //perto do mouse o alvo é 1 e longe é 0; elevar ao quadrado suaviza a queda nas bordas
          const alvo = Math.max(0, 1 - distancia / RAIO) ** 2;

          //anda só uma fração do caminho a cada quadro, por isso o quadrado sobe e desce devagar
          niveis[i] += (alvo - niveis[i]) * SUAVIDADE;

          if (alvo === 0 && niveis[i] < 0.003) niveis[i] = 0;
          else mexendo = true;
        }
      }

      desenhar();

      //quando tudo voltou ao chão a animação para, para não gastar bateria à toa
      animando = mexendo;
      if (mexendo) quadro = requestAnimationFrame(atualizar);
    }

    function acordar() {
      if (!animando) {
        animando = true;
        quadro = requestAnimationFrame(atualizar);
      }
    }

    function aoMoverMouse(evento) {
      //clientX/Y são relativos à janela; subtraímos a posição do canvas para ficar relativo a ele
      const caixa = canvas.getBoundingClientRect();
      mouse = { x: evento.clientX - caixa.left, y: evento.clientY - caixa.top };
      acordar();
    }

    function aoSairDaJanela() {
      mouse = { x: -9999, y: -9999 };
      acordar();
    }

    ajustarTamanho();

    //o ResizeObserver avisa quando o tamanho do pai muda (ex.: janela redimensionada)
    const observador = new ResizeObserver(ajustarTamanho);
    observador.observe(pai);

    if (!reduzirMovimento) {
      //ouvimos a janela inteira porque o formulário fica por cima do canvas e roubaria os eventos do mouse
      window.addEventListener("pointermove", aoMoverMouse);
      document.addEventListener("mouseleave", aoSairDaJanela);
    }

    //a função devolvida roda quando o componente sai da tela
    return () => {
      cancelAnimationFrame(quadro);
      observador.disconnect();
      window.removeEventListener("pointermove", aoMoverMouse);
      document.removeEventListener("mouseleave", aoSairDaJanela);
    };
  }, []);

  //aria-hidden: o fundo é só decoração e leitores de tela devem ignorá-lo
  return <canvas ref={canvasRef} className="fundo-quadrados" aria-hidden="true" />;
}

export default FundoQuadrados;