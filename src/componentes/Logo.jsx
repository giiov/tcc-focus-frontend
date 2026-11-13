import logoNuvem from "../assets/logo-nuvem.png";

//o logo é um componente porque vai aparecer em vários lugares (sidebar e login)
//a prop "compacto" mostra só a nuvem, para usar na sidebar recolhida
function Logo({ compacto = false }) {
  return (
    <div className="logo">
      {/*quando o texto aparece, a imagem é só decoração e o alt fica vazio
          quando só a nuvem aparece, o alt precisa dizer o nome para leitores de tela*/}
      <img
        src={logoNuvem}
        alt={compacto ? "FOCUS Multi-Cloud" : ""}
        className="logo__nuvem"
      />

      {!compacto && (
        <span className="logo__texto">
          <span className="logo__focus">FOCUS</span> Multi-Cloud
        </span>
      )}
    </div>
  );
}

export default Logo;