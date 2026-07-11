export type Classificacao =
  | "Crítico"
  | "Vulnerável"
  | "Em Desenvolvimento"
  | "Conformidade Adequada";

export const classificacaoCores: Record<
  Classificacao,
  { bg: string; text: string; border: string }
> = {
  "Crítico":               { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  "Vulnerável":            { bg: "#ffedd5", text: "#9a3412", border: "#fdba74" },
  "Em Desenvolvimento":    { bg: "#fef9c3", text: "#854d0e", border: "#fde047" },
  "Conformidade Adequada": { bg: "#dcfce7", text: "#14532d", border: "#86efac" },
};

export const classificacaoBarCor: Record<Classificacao, string> = {
  "Crítico":               "#dc2626",
  "Vulnerável":            "#ea580c",
  "Em Desenvolvimento":    "#ca8a04",
  "Conformidade Adequada": "#15803d",
};

export const classificacaoAnalise: Record<Classificacao, string> = {
  "Crítico": "Os resultados indicam lacunas críticas na conformidade regulatória e sustentabilidade da sua organização. A empresa está exposta a riscos imediatos de autuações, embargos operacionais e responsabilização dos gestores. É urgente iniciar um processo estruturado de regularização, priorizando as não conformidades mais graves. A ECO MUNDI pode apoiar sua organização com um plano de ação emergencial.",
  "Vulnerável": "Os resultados revelam vulnerabilidades significativas que colocam a organização em risco regulatório elevado. Embora alguns controles existam, há lacunas importantes que podem resultar em autuações, perda de licenças ou danos reputacionais. Recomendamos uma revisão estruturada dos processos de compliance e a implementação de um sistema de gestão regulatória.",
  "Em Desenvolvimento": "Sua organização demonstra avanços relevantes em conformidade regulatória e sustentabilidade, mas ainda existem áreas de melhoria que merecem atenção. Algumas categorias apresentam controles adequados, enquanto outras necessitam de fortalecimento. Um programa de melhoria contínua pode elevar significativamente o nível de conformidade e reduzir a exposição a riscos.",
  "Conformidade Adequada": "Parabéns! Sua organização demonstra um nível sólido de conformidade regulatória e maturidade em sustentabilidade. Os controles e processos estão bem estruturados. Recomendamos manter o monitoramento contínuo, acompanhar as mudanças legislativas e buscar a excelência em governança ambiental e ESG para consolidar sua posição como referência de boas práticas no setor.",
};

const analiseCategoria: Record<string, Record<Classificacao, string>> = {
  "Governança e Compliance Regulatório": {
    "Crítico": "A estrutura de governança regulatória está ausente ou extremamente frágil. Sem um responsável definido, controle documental e acompanhamento legislativo, a empresa opera com risco jurídico elevado.",
    "Vulnerável": "A governança regulatória é incipiente. A falta de processos formais para controle de documentos e monitoramento legal expõe a organização a multas e notificações de órgãos fiscalizadores.",
    "Em Desenvolvimento": "Existem iniciativas de compliance regulatório, mas a estrutura ainda carece de integração e atualização sistemática. Fortalecer o controle documental e o monitoramento legislativo trará ganhos imediatos.",
    "Conformidade Adequada": "A governança regulatória está bem estruturada, com responsável qualificado, controle documental atualizado e acompanhamento proativo das legislações aplicáveis.",
  },
  "Licenciamento e Autorizações": {
    "Crítico": "Identificamos lacunas críticas no licenciamento. Sem regularização imediata, sua empresa está exposta a autuações, embargos operacionais e responsabilização civil e criminal dos gestores.",
    "Vulnerável": "Há deficiências relevantes no gerenciamento de licenças e autorizações. O risco de autuação é elevado e exige revisão urgente das pendências identificadas junto aos órgãos competentes.",
    "Em Desenvolvimento": "O licenciamento está parcialmente estruturado, mas há oportunidades de melhoria no controle de vencimentos e no atendimento integral das condicionantes das licenças ambientais.",
    "Conformidade Adequada": "O licenciamento ambiental e as autorizações estão bem gerenciados, com documentos vigentes e controle sistemático das condicionantes e renovações.",
  },
  "Gestão de Resíduos": {
    "Crítico": "A gestão de resíduos apresenta falhas graves, com risco imediato de contaminação ambiental, responsabilização legal e geração de passivos ambientais de difícil e custosa remediação.",
    "Vulnerável": "Há vulnerabilidades importantes no gerenciamento de resíduos. A ausência ou inadequação do PGRS e da rastreabilidade pode resultar em autuações, passivos ambientais e danos à reputação.",
    "Em Desenvolvimento": "A gestão de resíduos está em evolução, mas requer sistematização dos processos de rastreabilidade, manifesto e comprovação de destinação final adequada.",
    "Conformidade Adequada": "A gestão de resíduos está estruturada, com PGRS vigente, destinação comprovada, rastreabilidade completa e equipes treinadas regularmente.",
  },
  "Sustentabilidade e Eficiência Operacional": {
    "Crítico": "A organização não possui práticas estruturadas de sustentabilidade operacional. A ausência de monitoramento de consumo e política de compras sustentáveis representa uma lacuna crescente frente às exigências do mercado.",
    "Vulnerável": "As práticas de sustentabilidade operacional são embrionárias. Sem monitoramento sistemático de consumo e política de compras sustentáveis, os custos e riscos regulatórios tendem a aumentar.",
    "Em Desenvolvimento": "Há iniciativas de sustentabilidade operacional, mas sem a consistência necessária para gerar economia real e atender às expectativas crescentes de parceiros e clientes.",
    "Conformidade Adequada": "A organização demonstra maturidade em eficiência operacional e sustentabilidade, com monitoramento de consumo, política de compras sustentáveis ativa e práticas de reuso de recursos.",
  },
  "Gestão Estratégica de Riscos": {
    "Crítico": "A empresa não possui instrumentos de gestão de riscos, expondo-se a incidentes ambientais, crises operacionais e emergências sem capacidade de resposta estruturada.",
    "Vulnerável": "Os instrumentos de gestão de riscos são insuficientes ou desatualizados. Planos de emergência e matrizes de risco obsoletos não protegem adequadamente a operação.",
    "Em Desenvolvimento": "Existem instrumentos de gestão de riscos, mas carecem de atualização e validação técnica. A contratação de consultoria especializada para revisão fortaleceria a resiliência operacional.",
    "Conformidade Adequada": "A gestão estratégica de riscos está bem estruturada, com matriz de riscos atualizada, planos de emergência validados e diagnósticos periódicos realizados por especialistas.",
  },
  "Critérios Reputacionais e Diferenciação Competitiva": {
    "Crítico": "A organização não possui posicionamento sustentável estruturado, o que representa risco reputacional crescente e limita o acesso a mercados, financiamentos e parcerias estratégicas mais exigentes.",
    "Vulnerável": "As práticas de comunicação e sustentabilidade são inconsistentes. A falta de política formalizada e evidências de práticas sustentáveis pode ser percebida como greenwashing pelo mercado.",
    "Em Desenvolvimento": "Há avanços em reputação e sustentabilidade, mas ainda sem a robustez necessária para atender plenamente às expectativas de clientes, investidores e parceiros estratégicos.",
    "Conformidade Adequada": "A organização demonstra maturidade reputacional, com política de sustentabilidade formalizada, comunicação consistente e avaliações positivas de stakeholders internos e externos.",
  },
};

export function getAnaliseCategoria(
  nomeCategoria: string,
  classificacao: Classificacao
): string {
  return (
    analiseCategoria[nomeCategoria]?.[classificacao] ??
    `Esta categoria apresenta nível "${classificacao}" de conformidade regulatória.`
  );
}

export function calcularClassificacao(percentual: number): Classificacao {
  if (percentual < 25) return "Crítico";
  if (percentual < 50) return "Vulnerável";
  if (percentual < 75) return "Em Desenvolvimento";
  return "Conformidade Adequada";
}
