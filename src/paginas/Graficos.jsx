import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  Treemap,
  XAxis,
  YAxis,
} from "recharts";

//cores do tema, usadas em ordem nos gráficos que têm várias fatias ou barras
const PALETA = ["#a63fb8", "#d37be0", "#7b2cbf", "#e0aaff", "#9d4edd", "#c77dff", "#f15bb5", "#5a189a"];

//estilo da caixinha que aparece ao passar o mouse: fundo escuro e texto branco para dar para ler
const estiloTooltip = { background: "#2a0a3d", border: "1px solid #a63fb8", borderRadius: 8, color: "#ffffff" };

//props repetidas em todo Tooltip, guardadas aqui para não copiar 8 vezes
//cursor muda o bloco cinza que aparece atrás da barra quando o mouse passa
const propsTooltip = {
  contentStyle: estiloTooltip,
  itemStyle: { color: "#ffffff" },
  labelStyle: { color: "#ffffff" },
  cursor: { fill: "rgba(255,255,255,0.08)" },
  formatter: (valor) => [formatar(Number(valor) || 0), "Custo"],
};

//converte o formato do backend ({rotulos: [...], valores: [...]}) no formato do recharts (lista de objetos)
//se o backend mandou null (coluna ausente no csv), devolve lista vazia, e a tela mostra "sem dados"
function paraLista(grafico) {
  if (!grafico) return [];
  return grafico.rotulos.map((nome, i) => ({ nome, valor: grafico.valores[i] }));
}

//formata número no padrão brasileiro: 1234.5 vira "1.234,50"
function formatar(numero, moeda) {
  const texto = Number(numero || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return moeda ? `${moeda} ${texto}` : texto;
}

//encurta identificadores longos de nuvem (ex: OCIDs da Oracle, ARNs da AWS) para caber na legenda sem sobrepor
function encurtarNomeRecurso(nome) {
  if (!nome || typeof nome !== "string") return "-";
  if (nome.length <= 18) return nome;

  // Se tiver barra ou dois pontos, pega o último segmento
  const partesBarra = nome.split(/[/:]/);
  const ultimoSegmento = partesBarra[partesBarra.length - 1];
  if (ultimoSegmento && ultimoSegmento !== nome && ultimoSegmento.length >= 3 && ultimoSegmento.length <= 22) {
    return ultimoSegmento;
  }

  // Se tiver pontos (ex: OCID), pega o último segmento se for curto e representativo
  const partesPonto = nome.split(".");
  const ultimoPonto = partesPonto[partesPonto.length - 1];
  if (ultimoPonto && ultimoPonto !== nome && ultimoPonto.length >= 3 && ultimoPonto.length <= 22) {
    return ultimoPonto;
  }

  // Fallback: início...fim (ex: ocid1.in...pute001)
  return `${nome.slice(0, 8)}...${nome.slice(-8)}`;
}

//cartão padrão de gráfico: se não houver dados suficientes, mostra um aviso em vez de um gráfico vazio
//"minimo" é quantos pontos o gráfico precisa para fazer sentido (área precisa de 2 dias, radar de 3 tags)
function CartaoGrafico({ titulo, dados, minimo = 1, classe = "", children }) {
  return (
    <div className={`cartao-vidro ${classe}`}>
      <h2>{titulo}</h2>
      {dados.length >= minimo ? children : <p className="dica">Sem dados suficientes neste arquivo para este gráfico.</p>}
    </div>
  );
}

//como desenhar cada retângulo do treemap: cor da paleta, nome completo com quebra automática de linha
//o recharts chama esta função uma vez por retângulo e entrega posição, tamanho, valor e nome
function CelulaTreemap({ x, y, width, height, index, name, depth, value, payload }) {
  //depth 0 é o retângulo "raiz" que envolve todos; não desenhamos esse
  if (depth === 0 || !width || !height) return null;

  const valor = value ?? payload?.valor ?? 0;
  const cor = PALETA[index % PALETA.length];
  //em blocos menores ou mais estreitos, reduzimos a fonte para exibir o nome completo
  const tamanhoFonte = width < 75 || height < 40 ? 10 : width < 120 ? 11 : 12;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={cor}
        stroke="#1a0626"
        strokeWidth={2}
        rx={4}
      >
        <title>{name ? `${name}: ${formatar(valor)}` : ""}</title>
      </rect>

      {/* foreignObject permite quebra de linha automática (word-break), garantindo que todos os nomes apareçam por inteiro */}
      {width > 16 && height > 16 && (
        <foreignObject
          x={x + 5}
          y={y + 5}
          width={Math.max(0, width - 10)}
          height={Math.max(0, height - 10)}
          style={{ overflow: "hidden", pointerEvents: "none" }}
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              width: "100%",
              height: "100%",
              color: "#ffffff",
              fontSize: `${tamanhoFonte}px`,
              fontWeight: 600,
              lineHeight: 1.22,
              wordBreak: "break-word",
              overflowWrap: "anywhere",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              overflow: "hidden",
              textShadow: "0 1px 3px rgba(0, 0, 0, 0.7)",
            }}
          >
            {name}
          </div>
        </foreignObject>
      )}
    </g>
  );
}

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

  const g = resultado.graficos;

  //prepara cada lista uma vez, aqui em cima, para o JSX de baixo ficar limpo
  const porServico = paraLista(g.custo_por_servico);
  const porDia = paraLista(g.custo_por_dia);
  const porCategoria = paraLista(g.custo_por_categoria);
  const porCobranca = paraLista(g.custo_por_tipo_cobranca);
  const porTipoRecurso = paraLista(g.custo_por_tipo_recurso);
  const porTag = paraLista(g.custo_por_tag);

  //o treemap procura o texto na chave "name", por isso renomeamos nome para name
  const tiposTreemap = porTipoRecurso.map((d) => ({ name: d.nome, valor: d.valor }));

  //funil: precisa estar do maior para o menor e só com valores positivos, senão o desenho não faz sentido
  //cada item recebe uma cor (fill), que é como o funil sabe pintar cada fatia
  const funil = paraLista(g.tipos_de_custo)
    .filter((d) => d.valor > 0)
    .sort((a, b) => b.valor - a.valor)
    .map((d, i) => ({
      ...d,
      rotulo: `${d.nome} (${formatar(d.valor)})`,
      fill: PALETA[i % PALETA.length],
    }));

  //barras radiais: cada barra precisa de "name" encurtado (para a legenda) e "fill" (a cor)
  const recursos = paraLista(g.top_recursos).map((d, i) => ({
    nomeCompleto: d.nome,
    name: encurtarNomeRecurso(d.nome),
    valor: d.valor,
    fill: PALETA[i % PALETA.length],
  }));

  const r = g.resumo;

  return (
    <section>
      <h1 className="pagina__titulo">Gráficos</h1>

      {/*cartões de resumo: os números mais importantes antes de qualquer gráfico*/}
      {r && (
        <div className="resumo">
          <div className="cartao-vidro">
            <span className="resumo__rotulo">Custo total</span>
            <strong className="resumo__numero">{formatar(r.custo_total, r.moeda)}</strong>
          </div>
          <div className="cartao-vidro">
            <span className="resumo__rotulo">Serviços utilizados</span>
            <strong className="resumo__numero">{r.qtd_servicos}</strong>
          </div>
          <div className="cartao-vidro">
            <span className="resumo__rotulo">Serviço mais caro</span>
            <strong className="resumo__numero">{r.servico_mais_caro ?? "-"}</strong>
          </div>
          <div className="cartao-vidro">
            <span className="resumo__rotulo">Créditos e descontos</span>
            <strong className="resumo__numero">{formatar(r.creditos, r.moeda)}</strong>
          </div>
        </div>
      )}

      <div className="graficos__grade">
        {/*1. barras verticais: custo por serviço (o que você já tinha)*/}
        <CartaoGrafico titulo="Custo por serviço" dados={porServico} classe="graficos__largo">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={porServico} margin={{ top: 15, right: 20, left: 15, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
              <XAxis dataKey="nome" stroke="#ffffff" interval={0} angle={-23} textAnchor="end" height={90} tick={{ fill: "#ffffff", fontSize: 11 }} />
              <YAxis stroke="#ffffff" width={80} tick={{ fill: "#ffffff", fontSize: 11 }} tickFormatter={(v) => formatar(v)} />
              <Tooltip {...propsTooltip} />
              <Bar dataKey="valor" name="Custo" fill="#a63fb8" maxBarSize={48} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CartaoGrafico>

        {/*2. área com degradê: evolução por dia (precisa de pelo menos 2 dias para formar uma linha)*/}
        <CartaoGrafico titulo="Custo por dia" dados={porDia} minimo={2} classe="graficos__largo">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={porDia} margin={{ top: 15, right: 20, left: 15, bottom: 10 }}>
              {/*defs guarda o degradê; o Area o usa pelo id com fill="url(#degrade)"*/}
              <defs>
                <linearGradient id="degrade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a63fb8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#a63fb8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
              <XAxis dataKey="nome" stroke="#ffffff" tick={{ fill: "#ffffff", fontSize: 11 }} />
              <YAxis stroke="#ffffff" width={80} tick={{ fill: "#ffffff", fontSize: 11 }} tickFormatter={(v) => formatar(v)} />
              <Tooltip {...propsTooltip} />
              {/*monotone deixa a linha curva e suave, em vez de pontiaguda*/}
              <Area type="monotone" dataKey="valor" name="Custo" stroke="#d37be0" strokeWidth={2} fill="url(#degrade)" />
            </AreaChart>
          </ResponsiveContainer>
        </CartaoGrafico>

        {/*3. rosca: proporção por categoria (é um PieChart com innerRadius, o "buraco" do meio)*/}
        <CartaoGrafico titulo="Custo por categoria de serviço" dados={porCategoria}>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart margin={{ top: 10, bottom: 20 }}>
              <Pie
                data={porCategoria}
                dataKey="valor"
                nameKey="nome"
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={88}
                paddingAngle={3}
              >
                {/*Cell pinta cada fatia com uma cor da paleta*/}
                {porCategoria.map((_, i) => (
                  <Cell key={i} fill={PALETA[i % PALETA.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip {...propsTooltip} />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconSize={10}
                wrapperStyle={{
                  color: "#ffffff",
                  fontSize: "12px",
                  paddingTop: "10px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CartaoGrafico>

        {/*4. barras horizontais: tipo de cobrança; créditos (negativos) ficam em rosa*/}
        <CartaoGrafico titulo="Custo por tipo de cobrança" dados={porCobranca}>
          <ResponsiveContainer width="100%" height={320}>
            {/*layout="vertical" é o que deita as barras; por isso o XAxis vira número e o YAxis vira categoria*/}
            <BarChart data={porCobranca} layout="vertical" margin={{ top: 15, right: 30, left: 15, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
              <XAxis type="number" stroke="#ffffff" tick={{ fill: "#ffffff", fontSize: 11 }} tickFormatter={(v) => formatar(v)} />
              <YAxis type="category" dataKey="nome" stroke="#ffffff" width={110} tick={{ fill: "#ffffff", fontSize: 12 }} />
              <Tooltip {...propsTooltip} />
              <Bar dataKey="valor" name="Custo" maxBarSize={36} radius={[0, 6, 6, 0]}>
                {porCobranca.map((d, i) => (
                  <Cell key={i} fill={d.valor < 0 ? "#f15bb5" : "#a63fb8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CartaoGrafico>

        {/*5. funil: do preço de tabela até o valor efetivamente pago*/}
        <CartaoGrafico titulo="Preço de lista até o valor efetivo" dados={funil} minimo={2}>
          <ResponsiveContainer width="100%" height={320}>
            <FunnelChart margin={{ top: 20, right: 150, bottom: 20, left: 20 }}>
              <Tooltip {...propsTooltip} />
              <Funnel dataKey="valor" nameKey="nome" data={funil} neckWidth={60} isAnimationActive>
                {/*LabelList escreve o nome dentro de cada fatia do funil*/}
                <LabelList position="right" dataKey="rotulo" fill="#ffffff" stroke="none" style={{ fontSize: "12px", fontWeight: 500 }} />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </CartaoGrafico>

        {/*6. treemap: cada retângulo é um tipo de recurso, e o tamanho é proporcional ao gasto*/}
        {/*minimo={2}: com um retângulo só o treemap vira um bloco gigante, então pedimos pelo menos 2*/}
        <CartaoGrafico titulo="Custo por tipo de recurso" dados={tiposTreemap} minimo={2}>
          <ResponsiveContainer width="100%" height={360}>
            <Treemap data={tiposTreemap} dataKey="valor" content={<CelulaTreemap />}>
              <Tooltip {...propsTooltip} />
            </Treemap>
          </ResponsiveContainer>
        </CartaoGrafico>

        {/*7. barras radiais: os 5 recursos mais caros*/}
        <CartaoGrafico titulo="Top 5 recursos mais caros" dados={recursos}>
          <ResponsiveContainer width="100%" height={320}>
            <RadialBarChart cx="28%" cy="50%" innerRadius="20%" outerRadius="85%" barSize={12} data={recursos}>
              <RadialBar dataKey="valor" background={{ fill: "rgba(255,255,255,0.08)" }} cornerRadius={6} />
              <Tooltip
                {...propsTooltip}
                formatter={(valor, _name, entry) => [
                  formatar(Number(valor) || 0),
                  entry?.payload?.nomeCompleto || entry?.payload?.name || "Custo",
                ]}
              />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                iconSize={10}
                wrapperStyle={{
                  color: "#ffffff",
                  fontSize: "12px",
                  lineHeight: "22px",
                  maxWidth: "52%",
                  paddingLeft: "8px",
                }}
                formatter={(value, entry) => {
                  const completo = entry?.payload?.nomeCompleto || value;
                  const valorFormatado = formatar(entry?.payload?.valor || 0);
                  return (
                    <span
                      title={`${completo} (${valorFormatado})`}
                      style={{
                        color: "#ffffff",
                        display: "inline-block",
                        maxWidth: "160px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        verticalAlign: "middle",
                      }}
                    >
                      {value}
                    </span>
                  );
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </CartaoGrafico>

        {/*8. radar: gasto por valor de tag; com menos de 3 tags o radar vira uma linha reta, então exigimos 3*/}
        <CartaoGrafico titulo={`Custo por tag${g.custo_por_tag ? ` (${g.custo_por_tag.chave})` : ""}`} dados={porTag} minimo={3}>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={porTag} outerRadius="65%" margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="rgba(255,255,255,0.25)" />
              <PolarAngleAxis dataKey="nome" tick={{ fill: "#ffffff", fontSize: 11 }} />
              <Tooltip {...propsTooltip} />
              <Radar dataKey="valor" name="Custo" stroke="#d37be0" fill="#a63fb8" fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        </CartaoGrafico>
      </div>
    </section>
  );
}

export default Graficos;