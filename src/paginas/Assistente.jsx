import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Sparkles } from "lucide-react";

//mesmo endereço da api usado no Início (vem do .env)
const API_URL = import.meta.env.VITE_API_URL;

//o backend só aproveita as últimas 10 mensagens (MAX_MENSAGEM_HISTORICO no assistente.py)
//mandar mais que isso só deixaria o envio mais pesado
const MAX_HISTORICO = 10;

//perguntas prontas para quem abre a página sem saber o que perguntar
const SUGESTOES = [
  "O que é o padrão FOCUS?",
  "Qual a diferença entre BilledCost e EffectiveCost?",
  "Como mapear as colunas de um provedor novo para o FOCUS?",
];

function Assistente() {
  //cada mensagem é { role: "user" | "assistant", content: "texto" }, o mesmo formato que a api espera
  const [mensagens, setMensagens] = useState([]);
  //texto é o que está escrito na caixa de mensagem agora
  const [texto, setTexto] = useState("");
  //carregando vale true enquanto esperamos a Ada responder
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  //conversaRef aponta para a área de mensagens, para rolarmos até a última
  const conversaRef = useRef(null);

  //sempre que chega mensagem nova (ou a Ada começa a "pensar"), a conversa rola até o fim
  useEffect(() => {
    const area = conversaRef.current;
    area.scrollTop = area.scrollHeight;
  }, [mensagens, carregando]);

  async function perguntar(pergunta) {
    const conteudo = pergunta.trim();
    if (!conteudo || carregando) return;

    const anteriores = mensagens;
    const novas = [...anteriores, { role: "user", content: conteudo }];

    setMensagens(novas);
    setTexto("");
    setErro("");
    setCarregando(true);

    //se algo der errado, a pergunta some da conversa e volta para a caixa de texto, e o usuário só reenvia
    function falhar(mensagemErro) {
      setMensagens(anteriores);
      setTexto(conteudo);
      setErro(mensagemErro);
    }

    try {
      const resposta = await fetch(`${API_URL}/assistente`, {
        method: "POST",
        //aqui mandamos json (e não arquivo), então o Content-Type precisa avisar isso
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagens: novas.slice(-MAX_HISTORICO) }),
      });

      const corpo = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        falhar(typeof corpo.detail === "string" ? corpo.detail : "A Ada não conseguiu responder agora.");
        return;
      }

      setMensagens([...novas, { role: "assistant", content: corpo.resposta }]);
    } catch {
      falhar("Não consegui falar com o servidor. Confira se a API está rodando.");
    } finally {
      setCarregando(false);
    }
  }

  function aoEnviar(evento) {
    //sem o preventDefault o formulário recarregaria a página inteira
    evento.preventDefault();
    perguntar(texto);
  }

  function aoPressionarTecla(evento) {
    //Enter envia e Shift+Enter pula linha; o isComposing evita enviar no meio de uma acentuação em andamento
    if (evento.key === "Enter" && !evento.shiftKey && !evento.nativeEvent.isComposing) {
      evento.preventDefault();
      perguntar(texto);
    }
  }

  return (
    <section className="ada">
      <h1 className="pagina__titulo">Ada</h1>
      <p className="dica ada__subtitulo">Assistente de FinOps e do padrão FOCUS</p>

      {/*aria-live faz o leitor de tela anunciar a resposta da Ada quando ela chega*/}
      <div className="cartao-vidro ada__conversa" ref={conversaRef} aria-live="polite">
        {mensagens.length === 0 && (
          <div className="ada__vazio">
            <span className="ada__avatar ada__avatar--grande" aria-hidden="true">
              <Sparkles size={22} />
            </span>
            <p>Pergunte sobre FinOps, o padrão FOCUS ou as colunas de custo.</p>
            <div className="ada__sugestoes">
              {SUGESTOES.map((sugestao) => (
                <button key={sugestao} type="button" className="ada__sugestao" onClick={() => perguntar(sugestao)}>
                  {sugestao}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensagens.map((mensagem, i) =>
          mensagem.role === "user" ? (
            <div key={i} className="ada__msg ada__msg--usuario">
              <div className="ada__balao">{mensagem.content}</div>
            </div>
          ) : (
            <div key={i} className="ada__msg ada__msg--ada">
              <span className="ada__avatar" aria-hidden="true">
                <Sparkles size={16} />
              </span>
              {/*a Ada responde em markdown (negrito, listas, tabelas); o ReactMarkdown transforma isso em HTML
                  o remark-gfm acrescenta o suporte a tabelas*/}
              <div className="ada__balao">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{mensagem.content}</ReactMarkdown>
              </div>
            </div>
          )
        )}

        {carregando && (
          <div className="ada__msg ada__msg--ada">
            <span className="ada__avatar" aria-hidden="true">
              <Sparkles size={16} />
            </span>
            <div className="ada__balao dica">Ada está pensando...</div>
          </div>
        )}
      </div>

      {erro && (
        <p className="erro" role="alert">
          {erro}
        </p>
      )}

      <form className="ada__form" onSubmit={aoEnviar}>
        <textarea
          className="ada__entrada"
          rows={2}
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          onKeyDown={aoPressionarTecla}
          placeholder="Escreva sua pergunta..."
          aria-label="Mensagem para a Ada"
          maxLength={2000}
        />
        <button className="ada__enviar" type="submit" disabled={!texto.trim() || carregando} aria-label="Enviar mensagem">
          <Send size={18} aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}

export default Assistente;