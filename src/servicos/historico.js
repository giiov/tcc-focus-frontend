//CAMADA DE SERVIÇO DO HISTÓRICO
//este é o único arquivo do frontend que vai falar com o banco (Supabase)
//as telas só chamam as duas funções abaixo; por isso o banco pode ser ligado sem mexer nelas
//para achar todos os pontos de conexão do projeto: git grep "TODO(banco)"
//
//CONTRATO: o formato de cada conversão que as telas esperam receber
//  { id, criado_em (texto ISO), nome_arquivo, formato ("aws" | "azure" | "gcp" | "oracle"), total_linhas }
//
//SUGESTÃO DE TABELA historico_conversoes (seguindo o padrão da tabela mensagens):
//  id (chave primária), user_id (uuid, auth.uid()), criado_em (default now()),
//  nome_arquivo (text), formato (text), total_linhas (integer), com RLS: cada usuário só vê e insere as suas

//TODO(banco): buscar no supabase as conversões do usuário logado, da mais nova para a mais antiga
//deve devolver uma lista no formato do CONTRATO (lista vazia se não houver nenhuma)
export async function listarConversoes() {
    return [{ id: 1, criado_em: "2026-11-17T14:32:00Z", nome_arquivo: "aws_teste_validacao_completa.csv", formato: "aws", total_linhas: 24 }];
}

//TODO(banco): gravar uma conversão na tabela historico_conversoes
//recebe só { nome_arquivo, formato, total_linhas }; user_id e criado_em o banco preenche sozinho
export async function salvarConversao({ nome_arquivo, formato, total_linhas }) {
  //ainda não faz nada
}