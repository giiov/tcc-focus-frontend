import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

//registrar é obrigatório: o chart.js só carrega o que a gente pede, para o site ficar leve
//isso roda uma vez, quando o arquivo é importado, e não a cada vez que a tela desenha
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

//o fundo do site é escuro, então o texto padrão do chart.js (cinza escuro) ficaria invisível
ChartJS.defaults.color = "#ffffff";

function Graficos({ resultado }) {
  //sem arquivo enviado, resultado é null; o aviso vem antes para não quebrar o código de baixo
  if (!resultado) {
    return (
      <section>
        <h1 className="pagina__titulo">Gráficos</h1>
        <p className="dica">Envie um arquivo na aba Início primeiro.</p>
      </section>
    );
  }

  //desestruturação: pega rotulos e valores de dentro do objeto que o backend mandou
  const { rotulos, valores } = resultado.graficos.custo_por_servico;

  //"data" é o formato que o chart.js pede: labels (eixo X) e datasets (as barras)
  const dados = {
    labels: rotulos,
    datasets: [{ label: "Custo", data: valores, backgroundColor: "#a63fb8" }],
  };

  //"options" muda o comportamento; aqui só colocamos um título
  const opcoes = {
    responsive: true,
    plugins: {
      title: { display: true, text: "Custo por serviço" },
    },
  };

  return (
    <section>
      <h1 className="pagina__titulo">Gráficos</h1>
      <div className="cartao-vidro">
        <Bar data={dados} options={opcoes} />
      </div>
    </section>
  );
}

export default Graficos;
