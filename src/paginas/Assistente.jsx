
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Check,
  Pencil,
  Plus,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
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

  // id da conversa selecionada
  const [conversaId, setConversaId] = useState(null);

  // lista de conversas do usuário
  const [conversas, setConversas] = useState([]);

  // texto digitado pelo usuário
  const [texto, setTexto] = useState("");

  // estados de carregamento
  const [carregando, setCarregando] = useState(false);
  const [carregandoConversas, setCarregandoConversas] = useState(true);

  // controle das operações de criar, renomear e excluir
  const [criando, setCriando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [tituloEdicao, setTituloEdicao] = useState("");
  const [operacaoId, setOperacaoId] = useState(null);

  // mensagens de erro
  const [erro, setErro] = useState("");
  const [erroLista, setErroLista] = useState("");

  // referências às áreas da interface
  const conversaRef = useRef(null);
  const tituloRef = useRef(null);

  // busca as conversas salvas no banco
  const carregarConversas = useCallback(async () => {
    setCarregandoConversas(true);
    setErroLista("");

    try {
      const dados = await chamarApi("/conversas");
      setConversas(dados);
    } catch (error) {
      console.error("Erro ao listar conversas:", error);
      setErroLista(error.message || "Não foi possível carregar as conversas.");
    } finally {
      setCarregandoConversas(false);
    }
  }, []);

  // carrega a lista quando a página é aberta
  useEffect(() => {
    carregarConversas();
  }, [carregarConversas]);

  // rola até a última mensagem
  useEffect(() => {
    const area = conversaRef.current;

    if (area) {
      area.scrollTop = area.scrollHeight;
    }
  }, [mensagens, carregando]);

  // coloca o cursor no campo de renomeação
  useEffect(() => {
    if (editandoId) {
      tituloRef.current?.focus();
      tituloRef.current?.select();
    }
  }, [editandoId]);

  // cria uma conversa no banco
  async function criarConversa() {
    if (criando || carregando) return;

    setCriando(true);
    setErro("");
    setErroLista("");

    try {
      const criada = await chamarApi("/conversas", {
        method: "POST",
      });

      // coloca a nova conversa no início da lista
      setConversas((anteriores) => [criada, ...anteriores]);

      // seleciona a conversa recém-criada
      setConversaId(criada.id);
      setMensagens([]);
      setTexto("");
      setEditandoId(null);
    } catch (error) {
      console.error("Erro ao criar conversa:", error);
      setErroLista(error.message || "Não foi possível criar uma conversa.");
    } finally {
      setCriando(false);
    }
  }

  // seleciona uma conversa da lista
  function selecionarConversa(conversa) {
    if (carregando) return;

    setConversaId(conversa.id);
    setMensagens([]);
    setTexto("");
    setErro("");
    setEditandoId(null);
  }

  // inicia a edição do título
  function iniciarEdicao(conversa) {
    setEditandoId(conversa.id);
    setTituloEdicao(conversa.titulo);
    setErroLista("");
  }

  // salva o novo título no banco
  async function salvarTitulo(id) {
    const titulo = tituloEdicao.trim();

    if (!titulo || titulo.length > 100 || operacaoId) return;

    setOperacaoId(id);
    setErroLista("");

    try {
      const atualizada = await chamarApi(`/conversas/${id}`, {
        method: "PATCH",
        json: { titulo },
      });

      setConversas((anteriores) =>
        anteriores.map((conversa) =>
          conversa.id === id
            ? { ...conversa, titulo: atualizada.titulo }
            : conversa
        )
      );

      setEditandoId(null);
    } catch (error) {
      console.error("Erro ao renomear conversa:", error);
      setErroLista(error.message || "Não foi possível renomear a conversa.");
    } finally {
      setOperacaoId(null);
    }
  }

  // cancela a edição sem salvar
  function cancelarEdicao() {
    setEditandoId(null);
    setTituloEdicao("");
  }

  // exclui uma conversa e suas mensagens
  async function apagarConversa(conversa) {
    if (operacaoId || carregando) return;

    const confirmou = window.confirm(
      `Deseja realmente excluir "${conversa.titulo}"? Esta ação não pode ser desfeita.`
    );

    if (!confirmou) return;

    setOperacaoId(conversa.id);
    setErroLista("");

    try {
      await chamarApi(`/conversas/${conversa.id}`, {
        method: "DELETE",
      });

      // remove a conversa da lista
      setConversas((anteriores) =>
        anteriores.filter((item) => item.id !== conversa.id)
      );

      // limpa a área principal se a conversa excluída estava selecionada
      if (conversaId === conversa.id) {
        setConversaId(null);
        setMensagens([]);
        setTexto("");
        setErro("");
      }

      if (editandoId === conversa.id) {
        setEditandoId(null);
      }
    } catch (error) {
      console.error("Erro ao excluir conversa:", error);
      setErroLista(error.message || "Não foi possível excluir a conversa.");
    } finally {
      setOperacaoId(null);
    }
  }

  // envia uma mensagem para a conversa atual
  async function perguntar(pergunta) {
    const conteudo = pergunta.trim();

    if (!conteudo || carregando) return;

    const anteriores = mensagens;

    setMensagens([
      ...anteriores,
      { role: "user", content: conteudo },
    ]);

    setTexto("");
    setErro("");
    setCarregando(true);

    function falhar(mensagemErro) {
      setMensagens(anteriores);
      setTexto(conteudo);
      setErro(mensagemErro);
    }

    try {
      let idAtual = conversaId;

      // cria uma conversa se nenhuma estiver selecionada
      if (!idAtual) {
        const criada = await chamarApi("/conversas", {
          method: "POST",
        });

        idAtual = criada.id;
        setConversaId(idAtual);
        setConversas((lista) => [criada, ...lista]);
      }

      const resposta = await chamarApi(
        `/conversas/${idAtual}/mensagens`,
        {
          method: "POST",
          json: { content: conteudo },
        }
      );

      const mensagensRecebidas = resposta.mensagens.map((mensagem) => ({
        role: mensagem.role,
        content: mensagem.content,
      }));

      setMensagens([...anteriores, ...mensagensRecebidas]);

      // atualiza os títulos e a ordem da lista após a mensagem
      await carregarConversas();
    } catch (error) {
      console.error("Erro ao conversar com a Ada:", error);
      falhar(error.message || "A Ada não conseguiu responder agora.");
    } finally {
      setCarregando(false);
    }
  }

  function aoEnviar(evento) {
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
      <div className="ada__layout">

        {/* lista lateral de conversas */}
        <aside className="ada__historico">
          <div className="ada__historico-topo">
            <div>
              <h2>Conversas</h2>
              <p>Seu histórico com a Ada</p>
            </div>

            <button
              type="button"
              className="ada__nova"
              onClick={criarConversa}
              disabled={criando || carregando}
              aria-label="Nova conversa"
              title="Nova conversa"
            >
              <Plus size={19} />
            </button>
          </div>

          <button
            type="button"
            className="ada__nova-larga"
            onClick={criarConversa}
            disabled={criando || carregando}
          >
            <Plus size={17} />
            Nova conversa
          </button>

          {erroLista && (
            <p className="ada__erro-lista" role="alert">
              {erroLista}
            </p>
          )}

          <div className="ada__lista">
            {carregandoConversas && conversas.length === 0 && (
              <p className="ada__lista-vazia">Carregando conversas...</p>
            )}

            {!carregandoConversas && conversas.length === 0 && (
              <p className="ada__lista-vazia">
                Nenhuma conversa por aqui. Comece uma nova!
              </p>
            )}

            {conversas.map((conversa) => (
              <div
                key={conversa.id}
                className={
                  conversaId === conversa.id
                    ? "ada__item ada__item--ativo"
                    : "ada__item"
                }
              >
                {editandoId === conversa.id ? (
                  <form
                    className="ada__edicao"
                    onSubmit={(evento) => {
                      evento.preventDefault();
                      salvarTitulo(conversa.id);
                    }}
                  >
                    <input
                      ref={tituloRef}
                      value={tituloEdicao}
                      onChange={(evento) =>
                        setTituloEdicao(evento.target.value)
                      }
                      maxLength={100}
                      aria-label="Novo título da conversa"
                    />

                    <button
                      type="submit"
                      disabled={!tituloEdicao.trim() || operacaoId === conversa.id}
                      aria-label="Salvar título"
                      title="Salvar"
                    >
                      <Check size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={cancelarEdicao}
                      aria-label="Cancelar edição"
                      title="Cancelar"
                    >
                      <X size={16} />
                    </button>
                  </form>
                ) : (
                  <>
                    <button
                      type="button"
                      className="ada__item-titulo"
                      onClick={() => selecionarConversa(conversa)}
                      title={conversa.titulo}
                      disabled={carregando}
                    >
                      <span>{conversa.titulo}</span>
                    </button>

                    <div className="ada__item-acoes">
                      <button
                        type="button"
                        onClick={() => iniciarEdicao(conversa)}
                        aria-label={`Renomear ${conversa.titulo}`}
                        title="Renomear"
                        disabled={Boolean(operacaoId)}
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => apagarConversa(conversa)}
                        aria-label={`Excluir ${conversa.titulo}`}
                        title="Excluir"
                        disabled={Boolean(operacaoId) || carregando}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* área principal da Ada */}
        <div className="ada__principal">
          <header className="ada__cabecalho">
            <h1 className="pagina__titulo">Ada</h1>
            <p className="dica ada__subtitulo">
              Assistente de FinOps e do padrão FOCUS
            </p>
          </header>

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
                  <div className="ada__balao">{mensagem.content}</div>
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
        </div>
      </div>
    </section>
  );
}

export default Assistente;