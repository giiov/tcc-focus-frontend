import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Sparkles } from "lucide-react";
import { chamarApi } from "../lib/api";

// perguntas prontas para quem abre a página
const SUGESTOES = [
  "O que é o padrão FOCUS?",
  "Qual a diferença entre BilledCost e EffectiveCost?",
  "Como mapear as colunas de um provedor novo para o FOCUS?",
];

function Assistente() {
  // mensagens exibidas na conversa atual
  const [mensagens, setMensagens] = useState([]);

  // id da conversa criada no banco
  const [conversaId, setConversaId] = useState(null);

  // texto digitado pelo usuário
  const [texto, setTexto] = useState("");

  // controla o envio e a resposta da Ada
  const [carregando, setCarregando] = useState(false);

  const [erro, setErro] = useState("");

  // referência à área de mensagens
  const conversaRef = useRef(null);

  // rola a conversa até a última mensagem
  useEffect(() => {
    const area = conversaRef.current;

    if (area) {
      area.scrollTop = area.scrollHeight;
    }
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

    // restaura a mensagem caso ocorra algum erro
    function falhar(mensagemErro) {
      setMensagens(anteriores);
      setTexto(conteudo);
      setErro(mensagemErro);
    }

    try {
      let idAtual = conversaId;

      // cria uma conversa quando ainda não existe uma selecionada
      if (!idAtual) {
        const criada = await chamarApi("/conversas", {
          method: "POST",
        });

        idAtual = criada.id;
        setConversaId(idAtual);
      }

      // envia a pergunta para a conversa
      const resposta = await chamarApi(
        `/conversas/${idAtual}/mensagens`,
        {
          method: "POST",
          json: {
            content: conteudo,
          },
        }
      );

      // atualiza as mensagens com o retorno do backend
      const mensagensRecebidas = resposta.mensagens.map((mensagem) => ({
        role: mensagem.role,
        content: mensagem.content,
      }));

      setMensagens([...anteriores, ...mensagensRecebidas]);

    } catch (error) {
      console.error("Erro ao conversar com a Ada:", error);

      falhar(
        error.message || "A Ada não conseguiu responder agora."
      );
    } finally {
      setCarregando(false);
    }
  }

  function aoEnviar(evento) {
    // impede o formulário de recarregar a página
    evento.preventDefault();

    perguntar(texto);
  }

  function aoPressionarTecla(evento) {
    // Enter envia; Shift + Enter pula linha
    if (
      evento.key === "Enter" &&
      !evento.shiftKey &&
      !evento.nativeEvent.isComposing
    ) {
      evento.preventDefault();
      perguntar(texto);
    }
  }

  return (
    <section className="ada">
      <h1 className="pagina__titulo">Ada</h1>
      <p className="dica ada__subtitulo">
        Assistente de FinOps e do padrão FOCUS
      </p>

      <div
        className="cartao-vidro ada__conversa"
        ref={conversaRef}
        aria-live="polite"
      >
        {mensagens.length === 0 && (
          <div className="ada__vazio">
            <span
              className="ada__avatar ada__avatar--grande"
              aria-hidden="true"
            >
              <Sparkles size={22} />
            </span>

            <p>
              Pergunte sobre FinOps, o padrão FOCUS ou as colunas de custo.
            </p>

            <div className="ada__sugestoes">
              {SUGESTOES.map((sugestao) => (
                <button
                  key={sugestao}
                  type="button"
                  className="ada__sugestao"
                  onClick={() => perguntar(sugestao)}
                >
                  {sugestao}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensagens.map((mensagem, i) =>
          mensagem.role === "user" ? (
            <div key={i} className="ada__msg ada__msg--usuario">
              <div className="ada__balao">
                {mensagem.content}
              </div>
            </div>
          ) : (
            <div key={i} className="ada__msg ada__msg--ada">
              <span className="ada__avatar" aria-hidden="true">
                <Sparkles size={16} />
              </span>

              <div className="ada__balao">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {mensagem.content}
                </ReactMarkdown>
              </div>
            </div>
          )
        )}

        {carregando && (
          <div className="ada__msg ada__msg--ada">
            <span className="ada__avatar" aria-hidden="true">
              <Sparkles size={16} />
            </span>

            <div className="ada__balao dica">
              Ada está pensando...
            </div>
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

        <button
          className="ada__enviar"
          type="submit"
          disabled={!texto.trim() || carregando}
          aria-label="Enviar mensagem"
        >
          <Send size={18} aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}

export default Assistente;