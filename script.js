import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAuyLoRREleZ9hA2JFBJhUk0oysY0AV_Zw",
  authDomain: "relatoriosescolamanain.firebaseapp.com",
  projectId: "relatoriosescolamanain",
  storageBucket: "relatoriosescolamanain.firebasestorage.app",
  messagingSenderId: "610886737458",
  appId: "1:610886737458:web:abe0e11610bc90ee9a662b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tabelaRelatorios = collection(db, "relatorios");

let idRelatorioAtual = null;

const EQUIPE = {
    pedagogia: {
        'ped1': { nome: "Jheniffer Cavalheiro André", cargo: "Coord. Pedagógica", registro: "RG 9.727.432-0 / Ata nº 15/2018", img: "asspedagoda.png" },
        'ped2': { nome: "Isabella Floripes Sanches", cargo: "Coord. Pedagógica", registro: "RG 10.617.697-3 / Ata nº 17/2021", img: "asspedagoda2.png" }
    },
    psicologia: {
        'psi1': { nome: "Jaqueline Gonçalves Malaquim", cargo: "Psicóloga Escolar", registro: "CRP 08/30548", img: "asspsicologa.png" },
        'psi2': { nome: "", cargo: "Psicóloga", registro: "", img: "" }
    },
    social: {
        'soc1': { nome: "Andrea Cristina Santos", cargo: "Assistente Social", registro: "CRESS/PR 9794", img: "asssocial.png" },
        'soc2': { nome: "", cargo: "Assistente Social", registro: "", img: "" }
    }
};


const CHECKLIST_DB = {
    pedagogica: {
        titulo: "Avaliação Pedagógica",
        targetId: "sintesePedagogica",
        itens: [
            { tipo: 'titulo', texto: '1. Cognição e Aprendizagem' },
            { id: 'ped01', label: "Atenção sustentada preservada", texto: "Demonstra boa capacidade de manter o foco em atividades propostas.", ind: "Ampliar gradativamente o tempo de atividade.", enc: "" },
            { id: 'ped02', label: "Atenção lábil/dispersa", texto: "Apresenta labilidade na atenção, dispersando-se com estímulos visuais ou sonoros.", ind: "Sentar próximo ao professor; reduzir distratores.", enc: "Avaliação Neuropsicológica." },
            { id: 'ped03', label: "Memória de curto prazo frágil", texto: "Demonstra dificuldade em reter comandos recentes ou sequências.", ind: "Uso de pistas visuais e fragmentação de tarefas.", enc: "" },
            { id: 'ped04', label: "Raciocínio Lógico-Matemático", texto: "Realiza correspondência, classificação e seriação de objetos.", ind: "Jogos de regras e contagem concreta.", enc: "" },
            { id: 'ped05', label: "Compreensão de tempo/espaço", texto: "Ainda não domina conceitos temporais (ontem/hoje) ou espaciais.", ind: "Uso de rotina visual e calendário diário.", enc: "" },
            { id: 'ped06', label: "Resolução de Problemas", texto: "Manifesta iniciativa na busca por soluções diante de pequenos obstáculos práticos.", ind: "Estimular desafios de lógica e jogos de construção.", enc: "" },
            { id: 'ped07', label: "Reconhecimento de Símbolos", texto: "Identifica visualmente letras e números, associando-os a seus contextos.", ind: "Atividades lúdicas de letramento e numeramento.", enc: "" },
            { id: 'ped08', label: "Planejamento e Organização", texto: "Necessita de apoio constante para organizar seus materiais e iniciar as tarefas.", ind: "Uso de checklists visuais e rotinas estruturadas.", enc: "" },
            { id: 'ped09', label: "Compreensão de Comandos", texto: "Compreende instruções simples, mas apresenta dificuldade com comandos de múltiplas etapas.", ind: "Fracionar as ordens verbais e solicitar feedback do aluno.", enc: "" },
            { id: 'ped10', label: "Generalização do Aprendizado", texto: "Demonstra dificuldade em aplicar conceitos aprendidos em novas situações ou contextos.", ind: "Variar os contextos de aplicação do mesmo conteúdo.", enc: "Acompanhamento Psicopedagógico." },
            
            { tipo: 'titulo', texto: '2. Linguagem e Comunicação' },
            { id: 'ped11', label: "Comunicação verbal fluente", texto: "Expressa-se verbalmente com clareza e vocabulário adequado.", ind: "Rodas de conversa e relato de experiências.", enc: "" },
            { id: 'ped12', label: "Atraso na fala / Dislalia", texto: "Apresenta trocas fonéticas ou fala ininteligível para estranhos.", ind: "Modelagem da fala correta sem infantilização.", enc: "Fonoaudiologia." },
            { id: 'ped13', label: "Não verbal / Gestual", texto: "Utiliza gestos, apontamentos ou puxa o interlocutor para comunicar desejos.", ind: "Introdução de Comunicação Aumentativa e Alternativa (PECS/Pranchas).", enc: "Fonoaudiologia." },
            { id: 'ped14', label: "Ecolalia (Repetição)", texto: "Apresenta ecolalia imediata ou tardia (repetição de frases de desenhos/pessoas).", ind: "Dar função comunicativa à fala repetida.", enc: "" },
            { id: 'ped15', label: "Intenção comunicativa baixa", texto: "Raramente inicia interação ou solicita algo.", ind: "Criar situações de necessidade de comunicação.", enc: "" },
            { id: 'ped16', label: "Compreensão de Ordens", texto: "Compreende e executa comandos verbais simples, mas necessita de apoio para instruções complexas.", ind: "Segmentar instruções e solicitar confirmação do entendimento.", enc: "" },
            { id: 'ped17', label: "Vocabulário Restrito", texto: "Comunica-se preferencialmente por palavras isoladas ou frases telegráficas, omitindo conectivos.", ind: "Atividades de nomeação e expansão de frases.", enc: "Fonoaudiologia." },
            { id: 'ped18', label: "Capacidade Narrativa", texto: "Consegue relatar pequenos fatos do cotidiano mantendo uma sequência lógica mínima.", ind: "Estimular o relato de eventos passados e histórias curtas.", enc: "" },
            { id: 'ped19', label: "Pragmática Social", texto: "Mantém contato visual e demonstra interesse na escuta durante diálogos dirigidos.", ind: "Jogos que envolvam turnos de fala e escuta.", enc: "" },
            { id: 'ped20', label: "Expressão de Necessidades", texto: "Manifesta verbalmente ou por gestos suas necessidades básicas (fome, sede, banheiro, dor).", ind: "Reforçar positivamente a iniciativa de comunicar desconforto.", enc: "" },

            { tipo: 'titulo', texto: '3. Leitura e Escrita (Psicogênese)' },
            { id: 'ped21', label: "Pré-Silábico", texto: "Encontra-se na hipótese pré-silábica (diferencia desenho de escrita).", ind: "Trabalhar letras do nome e alfabeto móvel.", enc: "" },
            { id: 'ped22', label: "Silábico (com/sem valor)", texto: "Encontra-se na hipótese silábica, associando grafia ao som (uma letra por sílaba).", ind: "Bingo de letras e completude de palavras.", enc: "" },
            { id: 'ped23', label: "Alfabético", texto: "Lê e escreve palavras simples e pequenos textos.", ind: "Produção textual e interpretação.", enc: "" },
            { id: 'ped24', label: "Grafismo/Coordenação Fina", texto: "Apresenta preensão do lápis imatura ou traçado trêmulo.", ind: "Atividades de alinhavo, massinha e rasgadura.", enc: "Terapia Ocupacional." },
            { id: 'ped25', label: "Reconhece o próprio nome", texto: "Identifica seu nome dentre outros.", ind: "Escrita do nome sem apoio.", enc: "" },
            { id: 'ped26', label: "Silábico-Alfabético", texto: "Encontra-se em transição: ora utiliza uma letra por sílaba, ora escreve a sílaba completa.", ind: "Análise fonológica de palavras e escrita espontânea.", enc: "" },
            { id: 'ped27', label: "Leitura Visual/Contextual", texto: "Realiza leitura de imagens, rótulos e logomarcas conhecidas, atribuindo significado ao contexto visual.", ind: "Exploração de livros de imagem e rotulagem do ambiente.", enc: "" },
            { id: 'ped28', label: "Orientação Espacial no Papel", texto: "Ainda não respeita a orientação convencional da escrita (esquerda para direita / cima para baixo) ou margens.", ind: "Uso de guias visuais, margens coloridas e pautas ampliadas.", enc: "Psicomotricidade." },
            { id: 'ped29', label: "Cópia Mecânica", texto: "Realiza cópia de palavras ou frases curtas do modelo, porém sem demonstrar compreensão do que escreveu.", ind: "Associar a escrita à leitura e ao significado da palavra.", enc: "" },
            { id: 'ped30', label: "Consciência Fonológica", texto: "Demonstra dificuldade em identificar rimas, aliterações ou segmentar palavras em sílabas oralmente.", ind: "Brincadeiras cantadas, rimas e contagem de sílabas com palmas.", enc: "Fonoaudiologia." },
            
            { tipo: 'titulo', texto: '4. Comportamento e Socialização' },
            { id: 'ped31', label: "Interação social adequada", texto: "Busca o outro para brincar e compartilha objetos.", ind: "Trabalhos em duplas.", enc: "" },
            { id: 'ped32', label: "Isolamento/Brincar solitário", texto: "Tende a isolar-se, preferindo objetos a pessoas.", ind: "Mediação de brincadeiras dirigidas.", enc: "Psicologia." },
            { id: 'ped33', label: "Comportamentos estereotipados", texto: "Apresenta movimentos repetitivos (flapping, balançar tronco) em momentos de ansiedade.", ind: "Oferecer reguladores sensoriais.", enc: "" },
            { id: 'ped34', label: "Baixa tolerância à frustração", texto: "Reage com desorganização comportamental diante do 'não'.", ind: "Trabalhar espera e regras claras.", enc: "Orientação Familiar." },
            { id: 'ped35', label: "Heteroagressividade", texto: "Apresenta episódios de agressividade física com pares ou adultos.", ind: "Manejo comportamental e registro de antecedentes.", enc: "Psiquiatria Infantil." },
            { id: 'ped36', label: "Agitação Psicomotora", texto: "Demonstra inquietude constante, dificuldade em permanecer sentado e impulsividade motora.", ind: "Atividades de gasto energético e intervalos ativos.", enc: "Neurologia Infantil." },
            { id: 'ped37', label: "Autoagressividade", texto: "Em momentos de crise, direciona a agressividade contra si próprio (morder-se, bater a cabeça).", ind: "Proteção física e identificação de gatilhos emocionais.", enc: "Psicologia / Psiquiatria." },
            { id: 'ped38', label: "Rigidez Cognitiva", texto: "Apresenta resistência intensa a mudanças na rotina ou na disposição do ambiente escolar.", ind: "Uso de antecipação visual e manutenção da rotina.", enc: "" },
            { id: 'ped39', label: "Hiperfoco/Interesse Restrito", texto: "Manifesta interesse excessivo e exclusivo por temas ou objetos específicos, dificultando a troca de assunto.", ind: "Utilizar o interesse como motivador para outras atividades.", enc: "" },
            { id: 'ped40', label: "Respeito às Regras", texto: "Demonstra dificuldade em compreender e acatar as normas de convivência coletiva.", ind: "Construção coletiva de combinados e reforço positivo.", enc: "" }
        ]
    },
    clinica: {
        titulo: "Avaliação Clínica",
        targetId: "sinteseClinica",
        itens: [
            { tipo: 'titulo', texto: '1. Saúde Neurológica e Geral' },
            { id: 'cli01', label: "Saúde Estável", texto: "Não apresenta queixas de saúde agudas no momento.", ind: "", enc: "" },
            { id: 'cli02', label: "Epilepsia/Convulsões", texto: "Diagnóstico de epilepsia com uso de anticonvulsivantes.", ind: "Observação constante de sinais de crise.", enc: "Neuropediatria." },
            { id: 'cli03', label: "Transtorno do Sono", texto: "Relato familiar de sono agitado ou insônia.", ind: "Avaliar impacto na sonolência diurna.", enc: "" },
            { id: 'cli04', label: "Alergias Alimentares/Respiratórias", texto: "Possui restrições alimentares ou alergias severas.", ind: "Controle rigoroso da merenda escolar.", enc: "Nutricionista." },
            { id: 'cli05', label: "Uso de Medicação Controlada", texto: "Faz uso contínuo de medicação psicotrópica que pode alterar o estado de alerta.", ind: "Monitorar possíveis efeitos colaterais em sala.", enc: "Psiquiatria Infantil." },
            { id: 'cli06', label: "Controle Esfincteriano Ausente", texto: "Ainda não adquiriu controle dos esfíncteres, necessitando de uso de fraldas.", ind: "Auxílio na higiene e trocas regulares.", enc: "" },
            { id: 'cli07', label: "Comprometimento Motor", texto: "Apresenta alterações no tônus muscular ou mobilidade reduzida.", ind: "Adaptação de mobiliário e auxílio nos deslocamentos.", enc: "Fisioterapia." },
            { id: 'cli08', label: "Deficiência Sensorial (Visão/Audição)", texto: "Apresenta diagnóstico ou sinais de baixa visão ou hipoacusia.", ind: "Posicionamento estratégico em sala e recursos adaptados.", enc: "Oftalmologia / Otorrino." },
            { id: 'cli09', label: "Disfagia / Risco de Engasgo", texto: "Apresenta dificuldade de deglutição com risco de broncoaspiração.", ind: "Supervisão total e consistência pastosa na alimentação.", enc: "Fonoaudiologia." },
            { id: 'cli10', label: "Seletividade Alimentar", texto: "Restrição severa a determinados grupos alimentares ou texturas.", ind: "Dessensibilização gradual sem forçar a ingestão.", enc: "Terapia Ocupacional / Nutrição." },

            { tipo: 'titulo', texto: '2. Integração Sensorial' },
            { id: 'cli11', label: "Hipersensibilidade Auditiva", texto: "Tapa os ouvidos ou desorganiza-se com sons altos (sinal, música).", ind: "Uso de abafadores em momentos críticos.", enc: "TO (Integração Sensorial)." },
            { id: 'cli12', label: "Busca Sensorial Tátil", texto: "Toca tudo excessivamente ou coloca objetos na boca.", ind: "Ofertar mordedores ou objetos de textura.", enc: "" },
            { id: 'cli13', label: "Seletividade Alimentar (Sensorial)", texto: "Recusa texturas ou cores específicas de alimentos.", ind: "Aproximação lúdica com alimentos.", enc: "Fonoaudiologia/Nutrição." },
            { id: 'cli14', label: "Hipersensibilidade Tátil", texto: "Demonstra aversão a texturas molhadas, grudentas (cola, tinta) ou toque leve.", ind: "Respeitar limites e introduzir texturas secas gradualmente.", enc: "Terapia Ocupacional." },
            { id: 'cli15', label: "Busca por Pressão Profunda", texto: "Procura abraços fortes, aperta-se em cantos ou busca contato físico intenso para se acalmar.", ind: "Atividades de compressão com almofadas ou colchonetes.", enc: "" },
            { id: 'cli16', label: "Busca Vestibular/Agitação", texto: "Necessita de movimento constante (girar, balançar, correr) para manter o alerta.", ind: "Pausas ativas e uso funcional do movimento.", enc: "" },
            { id: 'cli17', label: "Insegurança Gravitacional", texto: "Demonstra medo excessivo de tirar os pés do chão, subir degraus ou usar brinquedos de parque.", ind: "Oferecer apoio firme e não forçar o movimento.", enc: "Terapia Ocupacional." },
            { id: 'cli18', label: "Hipersensibilidade Visual", texto: "Irrita-se com excesso de luz ou poluição visual na sala, apertando os olhos.", ind: "Reduzir estímulos visuais na mesa de trabalho.", enc: "Oftalmologia." },
            { id: 'cli19', label: "Busca Olfativa", texto: "Tende a cheirar objetos, materiais escolares ou pessoas antes de interagir.", ind: "Direcionar para estímulos olfativos apropriados.", enc: "" },
            { id: 'cli20', label: "Hiporesponsividade à Dor", texto: "Parece não notar machucados ou não reage a estímulos dolorosos comuns.", ind: "Inspeção física regular após quedas ou impactos.", enc: "Pediatria." },

            { tipo: 'titulo', texto: '3. Autonomia (AVDs)' },
            { id: 'cli21', label: "Controle Esfincteriano Total", texto: "Utiliza o banheiro com total autonomia.", ind: "", enc: "" },
            { id: 'cli22', label: "Uso de Fraldas", texto: "Não possui controle de esfíncteres, fazendo uso de fraldas.", ind: "Trocas regulares e treino de toalete se houver prontidão.", enc: "" },
            { id: 'cli23', label: "Dependência na Alimentação", texto: "Necessita ser alimentado por um adulto.", ind: "Treino com colher adaptada.", enc: "" },
            { id: 'cli24', label: "Higiene Pessoal Assistida", texto: "Realiza lavagem de mãos e rosto apenas com supervisão.", ind: "Apoio visual no espelho do banheiro.", enc: "" },
            { id: 'cli25', label: "Desfralde em Processo", texto: "Encontra-se em fase de transição (retirada de fraldas), ocorrendo escapes ocasionais.", ind: "Rotina fixa de idas ao banheiro e reforço positivo.", enc: "" },
            { id: 'cli26', label: "Vestuário (Botões/Zíperes)", texto: "Apresenta dificuldade motora para abrir/fechar calças ou manusear roupas no banheiro.", ind: "Incentivar uso de roupas com elástico ou velcro.", enc: "Terapia Ocupacional." },
            { id: 'cli27', label: "Uso de Talheres", texto: "Alimenta-se sozinho, mas apresenta preensão inadequada ou dificuldade em cortar alimentos.", ind: "Uso de engrossadores ou adaptações de talher.", enc: "Terapia Ocupacional." },
            { id: 'cli28', label: "Organização de Pertences", texto: "Não gerencia seus materiais, esquecendo ou perdendo itens (mochila, casaco) com frequência.", ind: "Checklist visual de materiais na entrada e saída.", enc: "" },
            { id: 'cli29', label: "Mobilidade e Deslocamento", texto: "Necessita de guia para transitar entre ambientes escolares (sala/pátio) para não se perder.", ind: "Treino de orientação espacial e rotas fixas.", enc: "" },
            { id: 'cli30', label: "Autocuidado (Nariz/Boca)", texto: "Não percebe a necessidade de limpar o nariz ou a boca (sialorreia) espontaneamente.", ind: "Treino em frente ao espelho e disponibilização de lenços.", enc: "" },

            { tipo: 'titulo', texto: '4. Mobilidade e Tônus' },
            { id: 'cli31', label: "Marcha independente", texto: "Deambula sem apoio.", ind: "", enc: "" },
            { id: 'cli32', label: "Cadeirante", texto: "Usuário de cadeira de rodas.", ind: "Garantir acessibilidade e mudanças de decúbito.", enc: "Fisioterapia." },
            { id: 'cli33', label: "Hipotonia Global", texto: "Apresenta baixo tônus muscular (corpo 'mole'), dificultando postura sentada.", ind: "Mobiliário adaptado.", enc: "" },
            { id: 'cli34', label: "Hemiparesia/Paralisia", texto: "Comprometimento motor em um dos lados do corpo.", ind: "Estimular o lado funcional.", enc: "" },
            { id: 'cli35', label: "Hipertonia/Espasticidade", texto: "Apresenta rigidez muscular excessiva, limitando a amplitude de movimentos.", ind: "Posicionamento adequado e recursos de tecnologia assistiva.", enc: "Fisioterapia." },
            { id: 'cli36', label: "Instabilidade/Equilíbrio", texto: "Demonstra desequilíbrio postural com quedas frequentes ou tropeços.", ind: "Supervisão em escadas e terrenos irregulares.", enc: "Psicomotricidade." },
            { id: 'cli37', label: "Marcha em Equino", texto: "Deambula apoiando-se predominantemente na ponta dos pés.", ind: "Atividades sensoriais plantares e alongamento.", enc: "Ortopedia." },
            { id: 'cli38', label: "Uso de Andador/Muletas", texto: "Utiliza dispositivos de auxílio para realizar a marcha com segurança.", ind: "Manter vias de circulação desobstruídas.", enc: "" },
            { id: 'cli39', label: "Dispraxia Motora", texto: "Dificuldade no planejamento e execução de movimentos globais (correr, pular, chutar bola).", ind: "Circuitos motores e decomposição de movimentos.", enc: "Terapia Ocupacional." },
            { id: 'cli40', label: "Baixa Resistência Física", texto: "Apresenta fadiga rápida durante esforços físicos leves ou brincadeiras.", ind: "Alternar atividades de movimento com repouso.", enc: "" }
        ]
    },
    social: {
        titulo: "Serviço Social",
        targetId: "sinteseSocial",
        itens: [
            { tipo: 'titulo', texto: '1. Estrutura e Dinâmica Familiar' },
            { id: 'soc01', label: "Família Nuclear", texto: "Convive com pai, mãe e irmãos em ambiente estável.", ind: "Manter vínculo escola-família.", enc: "" },
            { id: 'soc02', label: "Monoparental (Mãe solo)", texto: "Responsabilidade financeira e afetiva centrada na figura materna.", ind: "Acolhimento e flexibilidade.", enc: "" },
            { id: 'soc03', label: "Família Extensa (Avós)", texto: "Sob cuidados legais ou informais dos avós.", ind: "", enc: "" },
            { id: 'soc04', label: "Conflitos Familiares", texto: "Relatos de brigas ou ambiente doméstico instável.", ind: "Escuta qualificada.", enc: "Psicologia/Assistência Social." },
            { id: 'soc05', label: "Negligência/Risco", texto: "Sinais de negligência nos cuidados básicos (higiene, saúde).", ind: "Acompanhamento rigoroso.", enc: "Conselho Tutelar (se grave)." },
            { id: 'soc06', label: "Guarda Compartilhada", texto: "Alternância de residência entre os genitores, exigindo adaptação da criança a duas rotinas distintas.", ind: "Uso de agenda de comunicação efetiva entre as casas.", enc: "" },
            { id: 'soc07', label: "Acolhimento Institucional", texto: "Reside em abrigo ou casa-lar sob tutela do Estado (medida protetiva).", ind: "Articulação frequente com a equipe técnica da instituição.", enc: "Vara da Infância e Juventude." },
            { id: 'soc08', label: "Resistência ao Diagnóstico", texto: "Família demonstra dificuldade em aceitar as limitações, laudos ou necessidades educativas especiais.", ind: "Reuniões de sensibilização focadas nas potencialidades.", enc: "Psicologia Escolar." },
            { id: 'soc09', label: "Vulnerabilidade Social (Risco)", texto: "Família em situação de precariedade socioeconômica, impactando acesso a materiais, alimentação ou terapias.", ind: "Verificar programas de auxílio estudantil.", enc: "Assistência Social / CRAS." },
            { id: 'soc10', label: "Família Participativa", texto: "Demonstra alto engajamento, seguindo orientações e mantendo terapias externas em dia.", ind: "Reforçar a parceria e alinhar estratégias casa-escola.", enc: "" },

            { tipo: 'titulo', texto: '2. Situação Socioeconômica' },
            { id: 'soc11', label: "Renda Estável", texto: "Família com renda compatível com as necessidades básicas.", ind: "", enc: "" },
            { id: 'soc12', label: "Situação de Pobreza", texto: "Família em situação de pobreza ou risco social.", ind: "Verificar cestas básicas.", enc: "CRAS." },
            { id: 'soc13', label: "Beneficiário BPC/LOAS", texto: "Estudante recebe Benefício de Prestação Continuada.", ind: "Manter Cadastro Único atualizado.", enc: "" },
            { id: 'soc14', label: "Beneficiário Bolsa Família", texto: "Família inserida em programas de transferência de renda.", ind: "Acompanhamento da frequência escolar.", enc: "" },
            { id: 'soc15', label: "Habitação Precária", texto: "Reside em moradia com condições insalubres ou de risco.", ind: "", enc: "COHAB/Serviço Social Habitação." },
            { id: 'soc16', label: "Desemprego na Família", texto: "Responsáveis legais encontram-se atualmente sem vínculo empregatício formal.", ind: "Isenção de taxas (se aplicável) e apoio com materiais.", enc: "Agência do Trabalhador / SINE." },
            { id: 'soc17', label: "Trabalho Informal/Instável", texto: "Sustento familiar provém de trabalhos temporários ('bicos'), gerando instabilidade financeira.", ind: "Flexibilidade nos prazos de solicitações de materiais.", enc: "" },
            { id: 'soc18', label: "Insegurança Alimentar", texto: "Relatos de escassez de alimentos ou falta de regularidade nas refeições em casa.", ind: "Priorizar a alimentação na escola; verificar programas de doação.", enc: "Banco de Alimentos / Assistência Social." },
            { id: 'soc19', label: "Dificuldade de Transporte (Financeira)", texto: "Falta de recursos financeiros para custear o deslocamento até a escola ou terapias.", ind: "Verificar elegibilidade para transporte escolar gratuito ou passe livre.", enc: "" },
            { id: 'soc20', label: "Exclusão Digital", texto: "Não possui acesso à internet ou equipamentos (computador/celular) para atividades remotas.", ind: "Fornecimento de atividades impressas ou uso do laboratório escolar.", enc: "" },

            { tipo: 'titulo', texto: '3. Rede de Apoio e Direitos' },
            { id: 'soc21', label: "Acesso ao SUS", texto: "Realiza acompanhamento regular na UBS de referência.", ind: "", enc: "" },
            { id: 'soc22', label: "Sem terapias externas", texto: "Não realiza atendimentos clínicos fora da escola, apesar da necessidade.", ind: "Reforçar importância das terapias.", enc: "Encaminhar para regulação municipal." },
            { id: 'soc23', label: "Transporte Público/Passe Livre", texto: "Utiliza transporte coletivo com isenção tarifária.", ind: "", enc: "" },
            { id: 'soc24', label: "Dificuldade de Transporte (Logística)", texto: "Família relata dificuldade financeira ou logística para levar à escola.", ind: "", enc: "Transporte Especial (se elegível)." },
            { id: 'soc25', label: "Terapias em Andamento", texto: "Frequenta regularmente atendimentos especializados (Fono/Psico/TO) na rede pública ou privada.", ind: "Solicitar relatórios de evolução aos terapeutas.", enc: "" },
            { id: 'soc26', label: "Convênio Médico Privado", texto: "Possui plano de saúde particular, não dependendo exclusivamente da rede pública.", ind: "", enc: "" },
            { id: 'soc27', label: "Apoio de ONGs/Instituições", texto: "Participa de atividades em instituições do terceiro setor (APAE, Pestalozzi, ONGs) no contraturno.", ind: "Estabelecer canal de comunicação com a instituição.", enc: "" },
            { id: 'soc28', label: "Farmácia de Alto Custo", texto: "Necessita de medicação controlada fornecida pelo Estado (Farmácia Especial).", ind: "Auxiliar a família no controle de receitas e processos administrativos.", enc: "Regional de Saúde." },
            { id: 'soc29', label: "Documentação PCD/CIPTEA", texto: "Possui Carteira de Identificação da Pessoa com Transtorno do Espectro Autista ou PCD.", ind: "Garantia de prioridade e direitos legais.", enc: "" },
            { id: 'soc30', label: "Acompanhamento Jurídico", texto: "Família assistida pela Defensoria Pública ou Ministério Público em questões de direitos da criança.", ind: "Manter registros escolares organizados para eventuais solicitações.", enc: "Defensoria Pública." },

            { tipo: 'titulo', texto: '4. Barreiras Sociais Identificadas' },
            { id: 'soc31', label: "Preconceito e estigmatização", texto: "Relatos de situações de discriminação ou exclusão social vivenciadas pela família ou estudante devido à deficiência.", ind: "Acolhimento familiar e projetos de conscientização na comunidade.", enc: "Psicologia / Assistência Social." },
            { id: 'soc32', label: "Falta de acessibilidade", texto: "Enfrenta barreiras arquitetônicas, comunicacionais ou atitudinais que impedem a plena participação na cidade.", ind: "Orientação sobre leis de acessibilidade e mobilidade.", enc: "Ministério Público (se recorrente)." },
            { id: 'soc33', label: "Negligência institucional", texto: "Histórico de omissão ou falta de atendimento adequado por parte de serviços públicos essenciais.", ind: "Empoderamento da família sobre seus direitos.", enc: "Defensoria Pública." },
            { id: 'soc34', label: "Dificuldade de acesso a serviços", texto: "Barreiras burocráticas, filas excessivas ou falta de vagas impedem o acesso à saúde ou assistência.", ind: "Articulação de rede para prioridade no atendimento.", enc: "CRAS / CREAS." },
            { id: 'soc35', label: "Violação de direitos", texto: "Indícios de desrespeito aos direitos fundamentais previstos no ECA ou na Lei Brasileira de Inclusão.", ind: "Registro formal e notificação imediata aos órgãos de proteção.", enc: "Conselho Tutelar." },
            { id: 'soc36', label: "Bullying ou Exclusão por Pares", texto: "Sofre violência física ou psicológica sistemática, ou isolamento deliberado por parte de colegas.", ind: "Mediação de conflitos e projetos de cultura de paz.", enc: "Orientação Educacional / Psicologia." },
            { id: 'soc37', label: "Barreiras Informacionais", texto: "Família desconhece a rede de proteção, direitos básicos ou trâmites burocráticos necessários.", ind: "Letramento em direitos e simplificação das orientações.", enc: "Serviço Social." },
            { id: 'soc38', label: "Vulnerabilidade Territorial", texto: "Residência em área de risco ou conflito que impede a livre circulação, visitas domiciliares ou frequência escolar.", ind: "Estratégias de busca ativa e flexibilidade.", enc: "CRAS." },
            { id: 'soc39', label: "Sobrecarga do Cuidador", texto: "Ausência de rede de apoio familiar, gerando exaustão no responsável principal e afetando o cuidado.", ind: "Encaminhamento para grupos de apoio e fortalecimento de vínculos.", enc: "Saúde da Família / CAPS." },
            { id: 'soc40', label: "Barreiras Comunicacionais", texto: "Falta de intérpretes (Libras), recursos em Braille ou comunicação acessível nos serviços públicos.", ind: "Solicitação formal de acessibilidade comunicacional.", enc: "Ministério Público." }
        ]
    }
};

let dadosSelecionados = {
    pedagogica: { manual: "", itens: [], textoGerado: "", indicacoes: [], encaminhamentos: [] },
    clinica: { manual: "", itens: [], textoGerado: "", indicacoes: [], encaminhamentos: [] },
    social: { manual: "", itens: [], textoGerado: "", indicacoes: [], encaminhamentos: [] }
};
let areaAtual = '';

function showToast(msg = "Operação realizada com sucesso!") {
    const toast = document.getElementById("toast");
    if(toast) {
        toast.innerText = msg;
        toast.className = "show";
        setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
    }
}

function autoResize(el) {
    if(el) {
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    }
}

function resizeAllTextareas() {
    document.querySelectorAll('textarea').forEach(el => autoResize(el));
}

function getLabelById(area, id) {
    const itens = CHECKLIST_DB[area].itens;
    const itemEncontrado = itens.find(i => i.id === id);
    return itemEncontrado ? itemEncontrado.label : "";
}

window.calcularIdade = function() {
    const dataNascInput = document.getElementById('dataNascimento');
    if (!dataNascInput.value) return;

    const nascimento = new Date(dataNascInput.value);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade--;
    document.getElementById('idade').value = idade + " anos";
}

window.trocarAssinatura = function(area, idProfissional) {
    if (!idProfissional) return;

    const dados = EQUIPE[area][idProfissional];
    
    const imgEl = document.getElementById(`img_${area}`);
    if (imgEl && dados.img) imgEl.src = dados.img;

    const nomeEl = document.getElementById(`nome_${area}`);
    if (nomeEl) nomeEl.innerText = dados.nome;

    const cargoEl = document.getElementById(`cargo_${area}`);
    if (cargoEl) cargoEl.innerText = `${dados.cargo} - ${dados.registro}`;
}

window.abrirModal = function(area) {
    areaAtual = area;
    const dadosArea = CHECKLIST_DB[area];
    const memoria = dadosSelecionados[area];
    
    document.getElementById('modalTitulo').innerText = dadosArea.titulo;
    document.getElementById('obsManualInput').value = memoria.manual || "";

    const container = document.getElementById('modalChecklistContent');
    let html = '';
    
    dadosArea.itens.forEach(item => {
        if (item.tipo === 'titulo') {
            html += `<h4 class="checklist-section-title">${item.texto}</h4>`;
        } else {
            const checked = memoria.itens.includes(item.id) ? 'checked' : '';
            html += `
                <div class="check-item">
                    <input type="checkbox" id="${item.id}" 
                           data-texto="${item.texto}" 
                           data-ind="${item.ind || ''}" 
                           data-enc="${item.enc || ''}"
                           onchange="atualizarPreview()" ${checked}>
                    <label for="${item.id}">${item.label}</label>
                </div>`;
        }
    });
    container.innerHTML = html;
    atualizarPreview();
    document.getElementById('modalUniversal').style.display = 'flex';
}

window.fecharModal = function() {
    document.getElementById('modalUniversal').style.display = 'none';
}

window.atualizarPreview = function() {
    const manual = document.getElementById('obsManualInput').value;
    const checkboxes = document.querySelectorAll('#modalChecklistContent input[type="checkbox"]:checked');
    let textoAuto = "";
    
    checkboxes.forEach(chk => {
        if(chk.dataset.texto) {
            let trecho = chk.dataset.texto.trim();
            if(trecho.slice(-1) !== '.') trecho += '.';
            textoAuto += trecho + " ";
        }
    });

    document.getElementById('previewAutomatico').value = textoAuto;
    
    let final = "";
    if(manual.trim()) final += manual.trim() + (manual.trim().slice(-1) !== '.' ? '. ' : ' ');
    final += textoAuto.trim();
    
    const elPreview = document.getElementById('previewFinal');
    if(elPreview) elPreview.innerText = final || "(Vazio - Selecione itens ou digite)";
}

window.confirmarModal = function() {
    const manual = document.getElementById('obsManualInput').value;
    const checkboxes = document.querySelectorAll('#modalChecklistContent input[type="checkbox"]:checked');
    const textoGerado = document.getElementById('previewAutomatico').value;
    
    const ids = [];
    const inds = [];
    const encs = [];

    checkboxes.forEach(chk => {
        ids.push(chk.id);
        if(chk.dataset.ind) inds.push(chk.dataset.ind);
        if(chk.dataset.enc) encs.push(chk.dataset.enc);
    });

    dadosSelecionados[areaAtual] = { manual, itens: ids, textoGerado, indicacoes: inds, encaminhamentos: encs };

    const targetId = CHECKLIST_DB[areaAtual].targetId;
    const elSintese = document.getElementById(targetId);
    
    let textoFinalArea = "";
    if(manual.trim()) textoFinalArea += manual.trim() + "\n";
    textoFinalArea += textoGerado.trim();
    
    elSintese.value = textoFinalArea;
    
    gerarCamposAutomaticosGerais();
    fecharModal();
    setTimeout(() => autoResize(elSintese), 50);
}

function gerarCamposAutomaticosGerais() {
    let textoConclusao = "";
    let textoIndPed = "";
    let listaEnc = [];

    ['pedagogica', 'clinica', 'social'].forEach(area => {
        const dados = dadosSelecionados[area];
        const tituloArea = CHECKLIST_DB[area].titulo;

        if (dados.itens.length > 0) {
            const rotulos = dados.itens.map(id => getLabelById(area, id)).filter(l => l !== "");
            if (rotulos.length > 0) {
                // Título sem numeração
                textoConclusao += `Na ${tituloArea}, observou-se: ${rotulos.join(", ")}.\n`;
            }
        } 

        if (area === 'pedagogica' && dados.indicacoes.length > 0) {
            const unicos = [...new Set(dados.indicacoes)];
            textoIndPed += unicos.join(" ") + " ";
        }

        if (dados.encaminhamentos.length > 0) {
            listaEnc = listaEnc.concat(dados.encaminhamentos);
        }
    });

    const elConclusao = document.getElementById('conclusaoDiagnostica');
    elConclusao.value = textoConclusao.trim();
    autoResize(elConclusao);

    const elIndPed = document.getElementById('indicacoesPedagogicas');
    elIndPed.value = textoIndPed.trim();
    autoResize(elIndPed);

    const elEnc = document.getElementById('encaminhamentos');
    const unicosEnc = [...new Set(listaEnc.filter(e => e !== ""))];
    elEnc.value = unicosEnc.join(" / ");
    autoResize(elEnc);
}

window.salvarNovoRelatorioNoBanco = async function() {
    const nomeEstudante = document.getElementById('nomeEstudante').value;
    
    if(!nomeEstudante) {
        alert("Por favor, preencha o nome do estudante antes de salvar.");
        return;
    }

    const btn = document.querySelector('.btn-save');
    const originalIcon = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; 

    const relatorioData = {
        nome: nomeEstudante,
        dataSalvo: new Date().toLocaleDateString('pt-BR'),
        timestamp: Date.now(),
        header: {
            escola: document.getElementById('escola').value,
            nome: nomeEstudante,
            nasc: document.getElementById('dataNascimento').value,
            filiacao: document.getElementById('filiacao').value,
            dataAv: document.getElementById('dataAvaliacao').value
        },
        dados: dadosSelecionados
    };

    try {
        if (idRelatorioAtual) {
            const docRef = doc(db, "relatorios", idRelatorioAtual);
            await updateDoc(docRef, relatorioData);
            showToast("Relatório ATUALIZADO na nuvem!");
        } else {
            const docRef = await addDoc(tabelaRelatorios, relatorioData);
            idRelatorioAtual = docRef.id;
            showToast("Novo relatório SALVO na nuvem!");
        }
    } catch (e) {
        console.error("Erro ao salvar: ", e);
        alert("Erro ao salvar no banco de dados. Verifique sua conexão.");
    } finally {
        btn.innerHTML = originalIcon;
    }
}

window.abrirModalBusca = async function() {
    document.getElementById('modalBusca').style.display = 'flex';
    const listaDiv = document.getElementById('listaRelatorios');
    listaDiv.innerHTML = '<p style="text-align:center; margin-top:20px;"><i class="fas fa-spinner fa-spin"></i> Carregando da nuvem...</p>';
    
    try {
        const querySnapshot = await getDocs(tabelaRelatorios);
        const relatorios = [];
        querySnapshot.forEach((doc) => {
            relatorios.push({ id: doc.id, ...doc.data() });
        });
        
        relatorios.sort((a, b) => b.timestamp - a.timestamp);
        
        renderizarLista(relatorios);
        window.todosRelatoriosCache = relatorios;

    } catch (e) {
        console.error("Erro ao buscar: ", e);
        listaDiv.innerHTML = '<p style="text-align:center; color:red;">Erro ao buscar dados.</p>';
    }
}

window.filtrarRelatorios = function() {
    const termo = document.getElementById('inputBusca').value.toLowerCase();
    const filtrados = (window.todosRelatoriosCache || []).filter(r => r.nome.toLowerCase().includes(termo));
    renderizarLista(filtrados);
}

function renderizarLista(lista) {
    const listaDiv = document.getElementById('listaRelatorios');
    listaDiv.innerHTML = '';

    if (lista.length === 0) {
        listaDiv.innerHTML = '<p style="text-align:center; color:#999; margin-top:20px;">Nenhum relatório encontrado.</p>';
        return;
    }

    lista.forEach(relatorio => {
        const item = document.createElement('div');
        item.className = 'report-item';
        
        item.innerHTML = `
            <div class="report-info">
                <span class="report-name">${relatorio.nome}</span>
                <span class="report-date">Salvo em: ${relatorio.dataSalvo}</span>
            </div>
            <div class="report-actions">
                <button onclick="carregarRelatorioDoBanco('${relatorio.id}')" class="btn-action btn-load" title="Carregar">
                    <i class="fas fa-folder-open"></i> Carregar
                </button>
                <button onclick="excluirRelatorioDoBanco('${relatorio.id}')" class="btn-action btn-delete" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        listaDiv.appendChild(item);
    });
}

window.fecharModalBusca = function() {
    document.getElementById('modalBusca').style.display = 'none';
}

window.carregarRelatorioDoBanco = function(id) {
    const relatorio = window.todosRelatoriosCache.find(r => r.id === id);

    if (relatorio) {
        if(confirm(`Deseja carregar o relatório de "${relatorio.nome}"?`)) {
            idRelatorioAtual = id;

            document.getElementById('escola').value = relatorio.header.escola || "";
            document.getElementById('nomeEstudante').value = relatorio.header.nome || "";
            document.getElementById('dataNascimento').value = relatorio.header.nasc || "";
            document.getElementById('filiacao').value = relatorio.header.filiacao || "";
            document.getElementById('dataAvaliacao').value = relatorio.header.dataAv || "";
            calcularIdade();

            dadosSelecionados = relatorio.dados;
            
            ['pedagogica', 'clinica', 'social'].forEach(area => {
                const d = dadosSelecionados[area];
                const targetId = CHECKLIST_DB[area].targetId;
                const elSintese = document.getElementById(targetId);
                
                if(elSintese) {
                    let txt = "";
                    if(d.manual) txt += d.manual + "\n";
                    if(d.textoGerado) txt += d.textoGerado;
                    elSintese.value = txt.trim();
                    autoResize(elSintese);
                }
            });

            gerarCamposAutomaticosGerais();
            fecharModalBusca();
            showToast("Relatório carregado com sucesso!");
        }
    }
}

window.excluirRelatorioDoBanco = async function(id) {
    if(confirm("Tem certeza que deseja excluir este relatório permanentemente da nuvem?")) {
        try {
            await deleteDoc(doc(db, "relatorios", id));
            showToast("Relatório excluído.");
            abrirModalBusca();
            if(idRelatorioAtual === id) idRelatorioAtual = null;
        } catch (e) {
            console.error(e);
            alert("Erro ao excluir.");
        }
    }
}

window.limparTudo = function() {
    if(confirm("Deseja limpar a tela para um NOVO relatório?")) {
        document.querySelectorAll('input, textarea').forEach(el => el.value = '');
        dadosSelecionados = {
            pedagogica: { manual: "", itens: [], textoGerado: "", indicacoes: [], encaminhamentos: [] },
            clinica: { manual: "", itens: [], textoGerado: "", indicacoes: [], encaminhamentos: [] },
            social: { manual: "", itens: [], textoGerado: "", indicacoes: [], encaminhamentos: [] }
        };
        idRelatorioAtual = null; 
        location.reload();
    }
}

window.onload = function() {
    resizeAllTextareas();
};

window.onclick = function(e) {
    if(e.target == document.getElementById('modalUniversal')) fecharModal();
    if(e.target == document.getElementById('modalBusca')) fecharModalBusca();
}