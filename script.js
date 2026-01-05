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

// --- 2. DADOS DA EQUIPE ---
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

// --- 3. DADOS DO CHECKLIST (ATUALIZADO) ---
const CHECKLIST = {
    pedagogica: {
        titulo: "1.2 Avaliação Pedagógica e Funcional (Educação Especial)",
        grupos: [
            {
                nome: "Cognição, Currículo e Aprendizagem",
                itens: [
                    { label: "Nível de Alfabetização", txt: "Aluno não alfabetizado ou pré-silábico.", ind: "Método fônico/multissensorial.", enc: "Psicopedagogia" },
                    { label: "Letramento de Sobrevivência", txt: "Não lê placas de perigo, saída ou banheiros.", ind: "Leitura incidental de símbolos.", enc: "Pedagogia" },
                    { label: "Compreensão de Comandos", txt: "Necessita de apoio gestual/visual para entender.", ind: "Comunicação multimodal.", enc: "Fonoaudiologia" },
                    { label: "Raciocínio Lógico (Dinheiro)", txt: "Não reconhece valores ou não sabe usar dinheiro.", ind: "Mercadinho simulado.", enc: "Pedagogia" },
                    { label: "Memória Operacional", txt: "Esquece a instrução logo após ouvi-la.", ind: "Instruções curtas e fracionadas.", enc: "Neuropsicologia" },
                    { label: "Noção Temporal", txt: "Não compreende ontem/hoje/amanhã ou relógio.", ind: "Rotina visual linear.", enc: "Pedagogia" },
                    { label: "Generalização do Saber", txt: "Faz a tarefa na sala, mas não aplica na vida real.", ind: "Ensino naturalístico.", enc: "Psicopedagogia" },
                    { label: "Cores e Formas", txt: "Dificuldade em parear ou nomear cores/formas.", ind: "Jogos de classificação.", enc: "Pedagogia" },
                    { label: "Escrita do Nome", txt: "Não reconhece ou não escreve o próprio nome.", ind: "Crachá e treino motor.", enc: "Terapia Ocupacional" },
                    { label: "Causa e Efeito", txt: "Dificuldade em entender consequências de ações.", ind: "Jogos de ação/reação.", enc: "Psicologia" }
                ]
            },
            {
                nome: "Habilidades de Vida Diária (AVDs) e Autonomia",
                itens: [
                    { label: "Controle Esfincteriano", txt: "Uso de fraldas ou escapes frequentes.", ind: "Treino de toalete/Trocas.", enc: "Enfermagem/Família" },
                    { label: "Alimentação Autônoma", txt: "Dependência total/parcial para levar à boca.", ind: "Talheres engrossados/adaptados.", enc: "Terapia Ocupacional" },
                    { label: "Vestuário (Botões/Zíper)", txt: "Não consegue manipular fechos de roupas.", ind: "Treino com alinhavos/botões.", enc: "Terapia Ocupacional" },
                    { label: "Higiene Pessoal (Limpeza)", txt: "Não consegue limpar-se após usar o banheiro.", ind: "Supervisão e apoio físico.", enc: "Monitoria" },
                    { label: "Higiene Bucal", txt: "Não consegue escovar os dentes sozinho.", ind: "Escovação guiada.", enc: "Odontologia" },
                    { label: "Organização de Pertences", txt: "Não reconhece sua mochila ou perde itens.", ind: "Etiquetas visuais grandes.", enc: "Pedagogia" },
                    { label: "Uso de Bebedouro", txt: "Dificuldade motora para usar copo ou bebedouro.", ind: "Garrafa adaptada com canudo.", enc: "Terapia Ocupacional" },
                    { label: "Assoar o Nariz", txt: "Não sabe assoar o nariz ou limpar secreção.", ind: "Treino de higiene respiratória.", enc: "Fonoaudiologia" },
                    { label: "Amarrar Cadarços", txt: "Dificuldade motora fina para laços.", ind: "Tênis com velcro/elástico.", enc: "Família" },
                    { label: "Pedir Ajuda", txt: "Não solicita auxílio quando em dificuldade.", ind: "Treino de comunicação funcional.", enc: "Psicologia" }
                ]
            },
            {
                nome: "Comportamento, Socialização e Emocional",
                itens: [
                    { label: "Interação com Pares", txt: "Isolamento, não brinca ou agride colegas.", ind: "Mediação de brincadeiras.", enc: "Psicologia" },
                    { label: "Autoagressividade", txt: "Morde-se, bate a cabeça ou se arranha.", ind: "Contenção segura/Análise funcional.", enc: "Psiquiatria" },
                    { label: "Heteroagressividade", txt: "Agride fisicamente professores ou colegas.", ind: "Manejo comportamental.", enc: "Psicologia/Psiquiatria" },
                    { label: "Percepção de Perigo", txt: "Não avalia riscos (altura, carros, tomadas).", ind: "Supervisão 1:1 constante.", enc: "Monitoria/Família" },
                    { label: "Tolerância à Frustração", txt: "Desorganiza-se gravemente diante do 'não'.", ind: "Reforço diferencial.", enc: "Psicologia" },
                    { label: "Estereotipias Motoras", txt: "Movimentos repetitivos que atrapalham a função.", ind: "Redirecionamento de atenção.", enc: "Terapia Ocupacional" },
                    { label: "Comportamento Sexual", txt: "Toque inadequado em si ou nos outros em público.", ind: "Educação sexual adequada à idade.", enc: "Psicologia" },
                    { label: "Respeito a Regras", txt: "Dificuldade em seguir combinados da sala.", ind: "Quadro de regras visual.", enc: "Pedagogia" },
                    { label: "Contato Visual", txt: "Evita olhar nos olhos durante a interação.", ind: "Posicionar-se na altura do aluno.", enc: "Fonoaudiologia" },
                    { label: "Mudança de Rotina", txt: "Crise diante de imprevistos ou trocas de sala.", ind: "Antecipação visual de mudanças.", enc: "Pedagogia" }
                ]
            },
            {
                nome: "Tecnologia Assistiva e Adaptação de Materiais",
                itens: [
                    { label: "Recursos de Baixa Tecnologia", txt: "Não possui engrossadores ou tesoura adaptada.", ind: "Confecção/compra de recursos.", enc: "Terapia Ocupacional" },
                    { label: "Uso de Tablet/Computador", txt: "Dificuldade motora impede uso de mouse/teclado.", ind: "Mouse adaptado/Acionadores.", enc: "Informática Inclusiva" },
                    { label: "Softwares de Comunicação", txt: "Necessita de app (ex: Livox) mas não usa.", ind: "Implementação de prancha digital.", enc: "Fonoaudiologia" },
                    { label: "Adaptação Postural na Mesa", txt: "Cadeira escolar inadequada, pés balançando.", ind: "Apoio para pés e adaptação.", enc: "Fisioterapia" },
                    { label: "Recursos Visuais Ampliados", txt: "Fonte do material didático muito pequena.", ind: "Ampliação (Fonte 24+) e alto contraste.", enc: "Pedagogia" },
                    { label: "Cadernos Pautados", txt: "Dificuldade em respeitar a linha comum.", ind: "Pauta ampliada ou colorida.", enc: "Psicopedagogia" },
                    { label: "Óculos e Lupas", txt: "Possui óculos mas recusa o uso na sala.", ind: "Treino de adaptação.", enc: "Família/Professor" },
                    { label: "Eliminação de Barreiras", txt: "Mochila ou layout da sala impedem circulação.", ind: "Reorganização do espaço físico.", enc: "Gestão Escolar" },
                    { label: "Tempo de Prova", txt: "Não consegue terminar avaliações no tempo.", ind: "Tempo estendido (Lei).", enc: "Coordenação Pedagógica" },
                    { label: "Ledores e Escribas", txt: "Necessita de apoio para ler/escrever na prova.", ind: "Designação de tutor.", enc: "Coordenação Pedagógica" }
                ]
            },
            {
                nome: "Educação Física e Motricidade Global",
                itens: [
                    { label: "Participação nas Aulas", txt: "Excluído das atividades práticas.", ind: "Adaptação das regras/atividades.", enc: "Prof. Ed. Física" },
                    { label: "Coordenação Motora Grossa", txt: "Tropeça muito, cai ao correr.", ind: "Circuito psicomotor.", enc: "Fisioterapia" },
                    { label: "Compreensão de Regras", txt: "Não entende regras coletivas de jogos.", ind: "Jogos simplificados.", enc: "Prof. Ed. Física" },
                    { label: "Esquema Corporal", txt: "Não identifica direita/esquerda no corpo.", ind: "Atividades com espelho.", enc: "Psicomotricidade" },
                    { label: "Tolerância ao Esforço", txt: "Cansaço extremo ou falta de ar rápida.", ind: "Avaliação cardiorrespiratória.", enc: "Cardiologia" },
                    { label: "Equilíbrio", txt: "Dificuldade em pular num pé só.", ind: "Treino de equilíbrio.", enc: "Fisioterapia" },
                    { label: "Medo de Altura/Movimento", txt: "Pânico em brinquedos de parque.", ind: "Insegurança gravitacional.", enc: "Terapia Ocupacional" },
                    { label: "Vestuário Esportivo", txt: "Dificuldade em trocar de roupa para a aula.", ind: "Tempo extra/Privacidade.", enc: "Auxiliar de Classe" },
                    { label: "Inclusão no Time", txt: "Colegas não passam a bola/excluem.", ind: "Conscientização da turma.", enc: "Psicologia Escolar" },
                    { label: "Esporte Paralímpico", txt: "Potencial para bocha ou atletismo adaptado.", ind: "Encaminhar para centros de treino.", enc: "Esporte/Lazer" }
                ]
            },
            {
                nome: "Habilidades Artísticas e Criatividade",
                itens: [
                    { label: "Expressão pelo Desenho", txt: "Desenho muito imaturo (garatujas).", ind: "Estimulação do grafismo.", enc: "Arte-terapia" },
                    { label: "Sensibilidade Musical", txt: "Interesse intenso ou aversão a músicas.", ind: "Musicoterapia.", enc: "Musicoterapia" },
                    { label: "Manuseio de Materiais", txt: "Aversão a tocar em tinta ou cola.", ind: "Dessensibilização tátil.", enc: "Terapia Ocupacional" },
                    { label: "Criatividade", txt: "Brincadeira muito concreta, sem 'faz de conta'.", ind: "Estimulação do simbólico.", enc: "Psicologia" },
                    { label: "Recorte e Colagem", txt: "Não consegue usar tesoura.", ind: "Tesoura com mola.", enc: "Terapia Ocupacional" },
                    { label: "Memorização de Canções", txt: "Dificuldade em decorar letras.", ind: "Repetição e apoio visual.", enc: "Fonoaudiologia" },
                    { label: "Participação em Eventos", txt: "Recusa-se a participar de festas.", ind: "Respeitar limites/Bastidores.", enc: "Coordenação" },
                    { label: "Pintura", txt: "Não pinta dentro do contorno.", ind: "Bordas em relevo (cola quente).", enc: "Pedagogia" },
                    { label: "Teatro e Role-play", txt: "Dificuldade em assumir personagens.", ind: "Dramatização de histórias.", enc: "Artes" },
                    { label: "Interesse Focado", txt: "Desenha apenas um único tema.", ind: "Ampliação de repertório.", enc: "Psicologia" }
                ]
            }
        ]
    },
    clinica: {
        titulo: "1.3 Avaliação Clínica e Anamnese de Saúde (SUS)",
        grupos: [
            {
                nome: "Diagnósticos, CIDs e Histórico Médico",
                itens: [
                    { label: "Diagnóstico Principal (CID)", txt: "Laudo ausente, vencido ou CID genérico.", ind: "Solicitar laudo atualizado.", enc: "Médico Especialista" },
                    { label: "Deficiência Intelectual", txt: "Sinais de DI sem laudo formalizado.", ind: "Avaliação neuropsicológica/QI.", enc: "Neuropsicologia" },
                    { label: "Comorbidades Psiquiátricas", txt: "TDAH, TOD ou Ansiedade associados.", ind: "Acompanhamento psiquiátrico.", enc: "Psiquiatria" },
                    { label: "Doenças Crônicas", txt: "Diabetes, Asma, Cardiopatia, Hipertensão.", ind: "Plano de cuidados escolar.", enc: "Pediatria/Cardiologia" },
                    { label: "Alergias Alimentares", txt: "Alergia a leite (AALV), glúten, corantes.", ind: "Dieta especial/Alerta na cozinha.", enc: "Nutrição" },
                    { label: "Alergias Medicamentosas", txt: "Reação grave a Dipirona, Penicilina, etc.", ind: "Registro em ficha de emergência.", enc: "Enfermagem" },
                    { label: "Carteira de Vacinação", txt: "Vacinas atrasadas ou incompletas.", ind: "Atualização vacinal obrigatória.", enc: "UBS/Posto de Saúde" },
                    { label: "Exames Sensoriais", txt: "Nunca fez audiometria ou oftalmológico.", ind: "Triagem auditiva e visual.", enc: "Oftalmo/Otorrino" },
                    { label: "Histórico de Internações", txt: "Internações frequentes ou recentes.", ind: "Atenção à imunidade/fadiga.", enc: "Enfermagem" },
                    { label: "Prematuridade", txt: "Histórico de parto prematuro extremo.", ind: "Vigilância do desenvolvimento.", enc: "Neuropediatra" }
                ]
            },
            {
                nome: "Gerenciamento Medicamentoso",
                itens: [
                    { label: "Uso de Psicofármacos", txt: "Uso contínuo (Ritalina, Risperidona, etc.).", ind: "Monitorar comportamento.", enc: "Psiquiatria" },
                    { label: "Anticonvulsivantes", txt: "Uso para controle de epilepsia (Depakote, etc.).", ind: "Atenção à sonolência.", enc: "Neurologia" },
                    { label: "Administração na Escola", txt: "Necessita tomar remédio no horário de aula.", ind: "Receita e autorização dos pais.", enc: "Enfermagem" },
                    { label: "Adesão da Família", txt: "Família esquece ou não compra a medicação.", ind: "Conscientização/Serviço Social.", enc: "Assistente Social" },
                    { label: "Efeitos Colaterais", txt: "Aluno apresenta tremores, babação ou sedação.", ind: "Relatório para o médico.", enc: "Médico Assistente" },
                    { label: "Farmácia de Alto Custo", txt: "Dificuldade em conseguir medicação pelo SUS.", ind: "Auxílio no processo administrativo.", enc: "Assistente Social/Farmácia" },
                    { label: "Interação Medicamentosa", txt: "Uso de múltiplos fármacos (polifarmácia).", ind: "Vigilância de reações adversas.", enc: "Médico/Farmacêutico" },
                    { label: "Via de Administração", txt: "Uso de sonda (GTT) ou insulina injetável.", ind: "Cuidados de enfermagem.", enc: "Enfermagem" },
                    { label: "Medicação de Resgate", txt: "Necessita de medicação para crise convulsiva.", ind: "Protocolo de emergência.", enc: "SAMU/Enfermagem" },
                    { label: "Armazenamento", txt: "Medicamento requer refrigeração na escola.", ind: "Geladeira com controle temp.", enc: "Enfermagem" }
                ]
            },
            {
                nome: "Neurológico, Físico e Sensorial",
                itens: [
                    { label: "Crises Convulsivas", txt: "Crises ativas, ausências ou espasmos.", ind: "Proteção física durante crise.", enc: "Neurologia" },
                    { label: "Disfagia (Engasgo)", txt: "Tosse ao comer/beber, risco de aspiração.", ind: "Espessante e postura.", enc: "Fonoaudiologia" },
                    { label: "Hipersensibilidade Auditiva", txt: "Chora/agride com barulho alto.", ind: "Protetor auricular (fone).", enc: "Terapia Ocupacional" },
                    { label: "Baixa Visão/Cegueira", txt: "Dificuldade visual severa mesmo com óculos.", ind: "Materiais ampliados/Braille.", enc: "Oftalmo/Pedagogia" },
                    { label: "Perda Auditiva", txt: "Não responde a chamados ou pede repetição.", ind: "Uso de AASI/Libras.", enc: "Otorrino/Fono" },
                    { label: "Mobilidade (Cadeira)", txt: "Uso de cadeira de rodas, andador ou muletas.", ind: "Acessibilidade/Rampas.", enc: "Fisioterapia" },
                    { label: "Deformidades Ósseas", txt: "Escoliose grave, pés tortos, contraturas.", ind: "Posicionamento adequado.", enc: "Ortopedia/Fisio" },
                    { label: "Tônus Muscular", txt: "Espasticidade (duro) ou Hipotonia (mole).", ind: "Mobiliário adaptado.", enc: "Fisioterapia" },
                    { label: "Órteses (AFO/KAFO)", txt: "Indicado uso de órtese mas não possui.", ind: "Encaminhar p/ oficina ortopédica.", enc: "Reabilitação Física" },
                    { label: "Sialorreia (Babação)", txt: "Babação excessiva, molha roupa e mesa.", ind: "Uso de babador/bandana.", enc: "Fonoaudiologia" }
                ]
            },
            {
                nome: "Sexualidade, Puberdade e Adolescência",
                itens: [
                    { label: "Menarca/Menstruação", txt: "Menina não sabe lidar com absorvente.", ind: "Treino concreto de troca.", enc: "Enfermagem/T.O." },
                    { label: "Polução Noturna/Ereção", txt: "Menino assustado com mudanças corporais.", ind: "Conversa explicativa.", enc: "Psicologia/Médico" },
                    { label: "Privacidade", txt: "Troca de roupa ou toca partes íntimas em público.", ind: "Ensino de público x privado.", enc: "Psicologia Comportamental" },
                    { label: "Prevenção de Abuso", txt: "Não sabe identificar toque bom x ruim.", ind: "Treino de autoproteção.", enc: "Psicologia" },
                    { label: "Consentimento", txt: "Abraça/beija estranhos sem pedir permissão.", ind: "Regra do 'círculo de confiança'.", enc: "Psicologia" },
                    { label: "Higiene Íntima", txt: "Dificuldade na limpeza adequada.", ind: "Supervisão e treino de AVD.", enc: "Terapia Ocupacional" },
                    { label: "Identidade de Gênero", txt: "Questões sobre identidade/orientação.", ind: "Acolhimento sem julgamento.", enc: "Psicologia" },
                    { label: "Métodos Contraceptivos", txt: "Adolescente ativo sexualmente sem proteção.", ind: "Planejamento familiar/DIU.", enc: "Ginecologia/Urologia" },
                    { label: "Comportamento Masturbatório", txt: "Masturbação em sala de aula.", ind: "Redirecionamento para privado.", enc: "Psicologia" },
                    { label: "Mudanças Hormonais", txt: "TPM severa ou agressividade cíclica.", ind: "Avaliação hormonal.", enc: "Ginecologia/Endócrino" }
                ]
            },
            {
                nome: "Saúde Preventiva e Geral",
                itens: [
                    { label: "Saúde Bucal (Cáries)", txt: "Dentes em mau estado, dor ou halitose.", ind: "Tratamento odontológico.", enc: "CEO (Centro Odonto)" },
                    { label: "Bruxismo", txt: "Ranger de dentes diurno ou noturno.", ind: "Avaliação de estresse/Placa.", enc: "Odontologia" },
                    { label: "Parasitoses (Vermes)", txt: "Relato de coceira anal, barriga inchada.", ind: "Exame de fezes/Vermífugo.", enc: "Pediatria" },
                    { label: "Dermatologia", txt: "Micoses, assaduras por fralda ou escaras.", ind: "Cuidado com a pele.", enc: "Enfermagem" },
                    { label: "Obesidade/Sobrepeso", txt: "Ganho de peso excessivo.", ind: "Reeducação alimentar.", enc: "Nutrição" },
                    { label: "Baixo Peso/Anemia", txt: "Palidez, fraqueza, recusa alimentar.", ind: "Suplementação vitamínica.", enc: "Pediatria/Nutrição" },
                    { label: "Coluna/Postura", txt: "Postura curvada (cifose/lordose).", ind: "Reeducação postural (RPG).", enc: "Fisioterapia" },
                    { label: "Pés e Pisada", txt: "Pé chato ou caminhar na ponta dos pés.", ind: "Palmilhas ou botox.", enc: "Ortopedia" },
                    { label: "Constipação Intestinal", txt: "Fica dias sem evacuar, dor.", ind: "Aumento de fibras/água.", enc: "Gastroenterologista" },
                    { label: "Hidratação", txt: "Não bebe água espontaneamente.", ind: "Oferta programada de água.", enc: "Escola/Família" }
                ]
            },
            {
                nome: "Saúde Mental (Sintomas Específicos)",
                itens: [
                    { label: "Fobia Específica", txt: "Medo paralisante (cachorro, escuro).", ind: "Dessensibilização.", enc: "Psicologia" },
                    { label: "Transtorno de Pânico", txt: "Crises súbitas de taquicardia.", ind: "Manejo da ansiedade.", enc: "Psiquiatria" },
                    { label: "Luto ou Perda", txt: "Mudança após perda de ente querido.", ind: "Acolhimento do luto.", enc: "Psicologia" },
                    { label: "Tricotilomania", txt: "Arrancar cabelos ou sobrancelhas.", ind: "Terapia comportamental.", enc: "Psiquiatria" },
                    { label: "Escoriação", txt: "Cutucar feridas até sangrar.", ind: "Tratamento dermato/psi.", enc: "Psicologia" },
                    { label: "Humor Eufórico", txt: "Agitação extrema, não dorme.", ind: "Estabilização do humor.", enc: "Psiquiatria" },
                    { label: "Mutismo Seletivo", txt: "Fala em casa, mas não na escola.", ind: "Não forçar a fala.", enc: "Psicologia/Fono" },
                    { label: "Baixa Tolerância ao Erro", txt: "Rasga a tarefa se erra.", ind: "Trabalhar o erro como aprendizado.", enc: "Psicopedagogia" },
                    { label: "Dependência de Telas", txt: "Agressivo se retirado o celular.", ind: "Desmame gradual.", enc: "Psicologia" },
                    { label: "Alucinações", txt: "Fala sozinho/responde vozes.", ind: "Avaliação urgente.", enc: "CAPS Infantil" }
                ]
            }
        ]
    },
    social: {
        titulo: "1.4 Serviço Social e Garantia de Direitos",
        grupos: [
            {
                nome: "Direitos, Benefícios e Cidadania",
                itens: [
                    { label: "Benefício BPC/LOAS", txt: "Perfil elegível, mas benefício negado/não pedido.", ind: "Orientação para INSS.", enc: "Assistente Social" },
                    { label: "Curatela/Interdição", txt: "Adulto com DI sem responsável legal oficial.", ind: "Ação de curatela.", enc: "Defensoria Pública" },
                    { label: "Passe Livre", txt: "Sem recursos para transporte.", ind: "Cadastro Passe Livre.", enc: "CRAS/Transporte" },
                    { label: "Documentação Civil", txt: "Falta RG, CPF ou está desatualizado.", ind: "Emissão de 2ª via.", enc: "Instituto de Identificação" },
                    { label: "Carteira do Autista/PCD", txt: "Não possui CIPTEA ou identificação.", ind: "Solicitação do documento.", enc: "Órgão Competente" },
                    { label: "Insumos do SUS", txt: "Necessita de fraldas, sonda ou leite.", ind: "Cadastro programa insumos.", enc: "Secretaria de Saúde" },
                    { label: "TFD (Tratamento Fora)", txt: "Precisa de cirurgia em outra cidade.", ind: "Solicitação de TFD.", enc: "Secretaria de Saúde" },
                    { label: "Isenção Tarifária", txt: "Conta de luz/água atrasada.", ind: "Cadastro Tarifa Social.", enc: "CRAS" },
                    { label: "Cartão de Estacionamento", txt: "Direito a vaga especial não usufruído.", ind: "Solicitação ao trânsito.", enc: "Detran/Prefeitura" },
                    { label: "Prioridade Legal", txt: "Não conhecimento sobre fila preferencial.", ind: "Orientação sobre Lei.", enc: "Serviço Social" }
                ]
            },
            {
                nome: "Contexto Familiar e Vulnerabilidade",
                itens: [
                    { label: "Sobrecarga do Cuidador", txt: "Cuidador com sinais de exaustão/depressão.", ind: "Acolhimento e suporte.", enc: "CAPS/Psicologia" },
                    { label: "Segurança Alimentar", txt: "Relato de fome ou falta de alimentos.", ind: "Cesta básica emergencial.", enc: "CRAS/ONGs" },
                    { label: "Habitabilidade", txt: "Moradia insalubre (umidade/risco).", ind: "Visita domiciliar técnica.", enc: "Defesa Civil" },
                    { label: "Violência Doméstica", txt: "Suspeita de violência física/sexual.", ind: "Notificação compulsória.", enc: "Conselho Tutelar" },
                    { label: "Negligência", txt: "Criança chega suja ou roupas inadequadas.", ind: "Acompanhamento familiar.", enc: "CREAS" },
                    { label: "Uso de Drogas na Família", txt: "Responsáveis usuários de álcool/drogas.", ind: "Tratamento da dependência.", enc: "CAPS AD" },
                    { label: "Analfabetismo dos Pais", txt: "Pais não conseguem ler bilhetes.", ind: "Comunicação por áudio/EJA.", enc: "Educação de Jovens" },
                    { label: "Rede de Apoio Frágil", txt: "Família isolada, sem parentes.", ind: "Fortalecimento de vínculos.", enc: "CRAS" },
                    { label: "Irmãos com Deficiência", txt: "Outros filhos com deficiência sem atendimento.", ind: "Busca ativa dos irmãos.", enc: "Saúde/Educação" },
                    { label: "Acesso Digital", txt: "Sem celular/internet para contato.", ind: "Recados via vizinho.", enc: "Secretaria Escolar" }
                ]
            },
            {
                nome: "Preparação para o Trabalho e Vida Adulta",
                itens: [
                    { label: "Vocação/Habilidades", txt: "Sem projeto de vida profissional.", ind: "Teste vocacional adaptado.", enc: "Psicologia/T.O." },
                    { label: "Programa Jovem Aprendiz", txt: "Idade elegível mas não inscrito.", ind: "Encaminhar para CIEE/Instituições.", enc: "Serviço Social" },
                    { label: "Autonomia de Transporte", txt: "Não sabe pegar ônibus sozinho.", ind: "Treino de mobilidade urbana.", enc: "Família/T.O." },
                    { label: "Uso de Celular Funcional", txt: "Usa celular só para jogos.", ind: "Treino de apps úteis.", enc: "Pedagogia" },
                    { label: "Documentação Trabalhista", txt: "Não possui Carteira de Trabalho.", ind: "Emissão digital.", enc: "Poupatempo/Sine" },
                    { label: "Comportamento Profissional", txt: "Não entende hierarquia.", ind: "Simulação de ambiente de trabalho.", enc: "Oficinas" },
                    { label: "Manejo do Dinheiro", txt: "Não sabe conferir troco.", ind: "Educação financeira.", enc: "Pedagogia" },
                    { label: "Assinatura", txt: "Não sabe assinar o nome.", ind: "Treino de assinatura.", enc: "Terapia Ocupacional" },
                    { label: "Curatela Parcial", txt: "Avaliar necessidade para atos civis.", ind: "Orientação jurídica.", enc: "Defensoria" },
                    { label: "Cursos Profissionalizantes", txt: "Interesse em culinária/info.", ind: "Matrícula em cursos adaptados.", enc: "Serviço Social" }
                ]
            },
            {
                nome: "Lazer, Cultura e Esporte",
                itens: [
                    { label: "Atividade Física Extra", txt: "Sedentarismo fora da escola.", ind: "Projetos esportivos inclusivos.", enc: "Esportes" },
                    { label: "Convívio Comunitário", txt: "Frequenta apenas casa e escola.", ind: "Incentivo a ir em praças.", enc: "Família" },
                    { label: "Acesso à Cultura", txt: "Nunca foi ao cinema ou teatro.", ind: "Carteirinha meia-entrada.", enc: "Cultura" },
                    { label: "Férias e Finais de Semana", txt: "Passa feriados isolado.", ind: "Planejamento de lazer.", enc: "Família" },
                    { label: "Amizades Fora da Escola", txt: "Não tem amigos no bairro.", ind: "Aproximação com vizinhos.", enc: "Família" },
                    { label: "Habilidades Digitais", txt: "Não sabe buscar vídeos que gosta.", ind: "Ensino de navegação.", enc: "Informática" },
                    { label: "Acampamentos/Passeios", txt: "Nunca dormiu fora de casa.", ind: "Incentivo à autonomia.", enc: "Família" },
                    { label: "Talentos Especiais", txt: "Habilidade alta em arte/memória.", ind: "Investir no talento.", enc: "Arte/Cultura" },
                    { label: "Brinquedos Adequados", txt: "Brinquedos não condizem com idade.", ind: "Adequação material.", enc: "Terapia Ocupacional" },
                    { label: "Centros de Convivência", txt: "Necessita de espaço de socialização.", ind: "Inscrição no CCA.", enc: "CRAS" }
                ]
            },
            {
                nome: "Logística e Rotina Familiar",
                itens: [
                    { label: "Transporte Escolar", txt: "Dificuldade com horário da perua.", ind: "Ajuste de rotina matinal.", enc: "Transporte" },
                    { label: "Retaguarda Familiar", txt: "Se a mãe adoece, ninguém cuida.", ind: "Mapeamento de rede.", enc: "Serviço Social" },
                    { label: "Rotina de Sono (Casa)", txt: "Casa barulhenta/sem horário.", ind: "Higiene do sono familiar.", enc: "Orientação Parental" },
                    { label: "Espaço de Estudo", txt: "Não tem mesa para lição.", ind: "Adaptação de canto de estudos.", enc: "Serviço Social" },
                    { label: "Participação do Pai", txt: "Pai ausente dos cuidados.", ind: "Convite para reuniões.", enc: "Psicologia" },
                    { label: "Uso de Telas em Casa", txt: "Pais usam telas como 'babá'.", ind: "Conscientização.", enc: "Pedagogia" },
                    { label: "Organização Medicamentosa", txt: "Remédios ao alcance da criança.", ind: "Orientação de segurança.", enc: "Enfermagem" },
                    { label: "Comparecimento Escolar", txt: "Faltas excessivas.", ind: "Termo de responsabilidade.", enc: "Secretaria" },
                    { label: "Comunicação Escola", txt: "Agenda não é lida.", ind: "Reforço na comunicação.", enc: "Coordenação" },
                    { label: "Expectativas Familiares", txt: "Família espera 'cura' milagrosa.", ind: "Alinhamento de expectativas.", enc: "Psicologia" }
                ]
            }
        ]
    }
};

// --- 4. FUNÇÕES GLOBAIS (EXPOSTAS AO WINDOW) ---

function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight) + 'px';
}

window.addEventListener('load', () => {
    // Inicialização de textareas
    document.querySelectorAll('textarea').forEach(tx => {
        tx.addEventListener('input', function() { autoResize(this); });
    });

    // Inicializa Selects
    preencherSelect('selPedagogica', EQUIPE.pedagogia);
    preencherSelect('selPsicologia', EQUIPE.psicologia);
    preencherSelect('selSocial', EQUIPE.social);

    // Valores padrão
    window.trocarAssinatura('pedagogia', 'ped1');
    window.trocarAssinatura('psicologia', 'psi1');
    window.trocarAssinatura('social', 'soc1');
    
    window.atualizarDataAssinatura();
});

function preencherSelect(id, objetoCategoria) {
    const sel = document.getElementById(id);
    if(!sel) return;
    sel.innerHTML = "";
    for (const [key, dados] of Object.entries(objetoCategoria)) {
        const txt = dados.nome ? dados.nome : `Opção Vazia (${key})`;
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = txt;
        sel.appendChild(opt);
    }
}

// === LÓGICA DE ASSINATURA ===
window.trocarAssinatura = function(categoria, key) {
    const dados = EQUIPE[categoria][key];
    if(dados) {
        let sufixo = "";
        if(categoria === 'pedagogia') sufixo = 'Pedagogica';
        else if(categoria === 'psicologia') sufixo = 'Psicologia';
        else if(categoria === 'social') sufixo = 'Social';
        
        const imgEl = document.getElementById(`img${sufixo}`);
        const nomeEl = document.getElementById(`nome${sufixo}`);
        const cargoEl = document.getElementById(`cargo${sufixo}`);
        const regEl = document.getElementById(`reg${sufixo}`);
        const selEl = document.getElementById(`sel${sufixo}`);

        if(imgEl) { imgEl.src = dados.img; imgEl.style.display = dados.img ? 'block' : 'none'; }
        if(nomeEl) nomeEl.innerText = dados.nome;
        if(cargoEl) cargoEl.innerText = dados.cargo;
        if(regEl) regEl.innerText = dados.registro;
        if(selEl) selEl.value = key;
    }
};

window.calcularIdade = function() {
    const d = document.getElementById('dataNascimento').value;
    if(!d) return;
    const nasc = new Date(d);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    document.getElementById('idade').value = `${idade} anos`;
};

window.atualizarDataAssinatura = function() {
    const dtInput = document.getElementById('dataAvaliacao').value;
    const p = document.getElementById('localDataTexto');
    if(!dtInput) {
        p.innerText = "Londrina/PR, ____ de __________________ de _______.";
        return;
    }
    const d = new Date(dtInput + 'T12:00:00');
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    p.innerText = `Londrina/PR, ${d.toLocaleDateString('pt-BR', options)}.`;
};

// === LÓGICA DO CHECKLIST (SPLIT VIEW) ===
window.abrirModal = function(area) {
    areaAtual = area;
    const dados = CHECKLIST[area];
    document.getElementById('tituloModal').innerText = dados.titulo;
    
    // Limpa corpo e preview
    const corpo = document.getElementById('corpoChecklist');
    corpo.innerHTML = "";
    
    // Carrega texto atual da área principal para o preview
    const idArea = area === 'pedagogica' ? 'txtPedagogica' : area === 'clinica' ? 'txtClinica' : 'txtSocial';
    document.getElementById('textoAoVivo').value = document.getElementById(idArea).value;

    dados.grupos.forEach((g, gIdx) => {
        let html = `<div class="check-grupo"><h5>${g.nome}</h5>`;
        g.itens.forEach((it, iIdx) => {
            const idChk = `chk_${area}_${gIdx}_${iIdx}`;
            html += `
                <div class="check-item">
                    <input type="checkbox" id="${idChk}" onchange="window.atualizarPreview()"
                        data-txt="${it.txt}" data-ind="${it.ind}" data-enc="${it.enc}">
                    <label for="${idChk}">${it.label}</label> </div>`;
        });
        html += `</div>`;
        corpo.innerHTML += html;
    });
    document.getElementById('modalChecklist').style.display = 'flex';
};

// Atualiza o texto "Ao Vivo" na direita
window.atualizarPreview = function() {
    const checks = document.querySelectorAll('#corpoChecklist input:checked');
    let textos = [];
    checks.forEach(c => {
        if(c.dataset.txt) textos.push(c.dataset.txt);
    });
    document.getElementById('textoAoVivo').value = textos.join(" ");
};

window.confirmarChecklist = function() {
    // 1. Pega o texto principal da área (que pode ter sido editado na direita)
    const textoFinal = document.getElementById('textoAoVivo').value;
    const checks = document.querySelectorAll('#corpoChecklist input:checked');
    
    let ind = "", enc = "";
    
    // 2. Coleta Indicações e Encaminhamentos
    checks.forEach(c => {
        if(c.dataset.ind) ind += "• " + c.dataset.ind + "\n";
        if(c.dataset.enc) enc += "• " + c.dataset.enc + "\n";
    });

    // 3. Atualiza Área Principal
    const idArea = areaAtual === 'pedagogica' ? 'txtPedagogica' : areaAtual === 'clinica' ? 'txtClinica' : 'txtSocial';
    const elArea = document.getElementById(idArea);
    elArea.value = textoFinal;
    autoResize(elArea);

    // 4. Atualiza Globais (Indicações e Encaminhamentos)
    if(ind) { 
        const i = document.getElementById('txtIndicacoes'); 
        // Adiciona apenas se não estiver vazio, para evitar quebras extras
        i.value += (i.value ? "\n" : "") + ind; 
        autoResize(i); 
    }
    if(enc) { 
        const e = document.getElementById('txtEncaminhamentos'); 
        e.value += (e.value ? "\n" : "") + enc; 
        autoResize(e); 
    }

    // 5. Lógica da Conclusão Diagnóstica
    if(textoFinal) {
        const c = document.getElementById('txtConclusao');
        // Evita duplicar se o texto já estiver lá (verificação simples)
        if(!c.value.includes(textoFinal.substring(0, 20))) {
             c.value += (c.value ? "\n" : "") + textoFinal;
             autoResize(c);
        }
    }

    // LÓGICA ESPECIAL PARA CLÍNICA (CID e Medicação)
    if(areaAtual === 'clinica') {
        const cid = document.getElementById('inputCid').value;
        const med = document.getElementById('inputMedicacao').value;
        const conc = document.getElementById('txtConclusao');
        
        let headerConclusao = "";
        if(cid) headerConclusao += `O estudante apresenta hipótese diagnóstica de ${cid}. `;
        if(med) headerConclusao += `Faz uso da medicação: ${med}. `;
        
        if(headerConclusao) {
            // Insere no início da conclusão
            conc.value = headerConclusao + "\n" + conc.value;
            autoResize(conc);
        }
    }

    window.fecharModal('modalChecklist');
};

window.fecharModal = function(id) { document.getElementById(id).style.display = 'none'; };

// === GESTÃO DE DADOS ===
window.abrirBusca = function() { document.getElementById('modalBusca').style.display = 'flex'; window.executarBusca(); };

window.executarBusca = async function() {
    const termo = document.getElementById('buscaInput').value.toLowerCase();
    const lista = document.getElementById('listaResultados');
    lista.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Buscando...</p></div>';
    
    try {
        const q = query(tabelaRelatorios, orderBy('timestamp', 'desc'));
        const snap = await getDocs(q);
        
        lista.innerHTML = "";
        if(snap.empty) { lista.innerHTML = '<div class="empty-state"><p>Nenhum registro encontrado.</p></div>'; return; }

        let count = 0;
        snap.forEach(d => {
            const data = d.data();
            const nome = data.estudante ? data.estudante.toLowerCase() : "";
            const pai = data.filiacao ? data.filiacao.toLowerCase() : "";
            
            if(nome.includes(termo) || pai.includes(termo)) {
                count++;
                const dataF = data.timestamp ? new Date(data.timestamp.seconds*1000).toLocaleDateString() : "-";
                
                lista.innerHTML += `
                    <div class="result-card">
                        <div class="card-header">
                            <h4>${data.estudante || "Sem Nome"}</h4>
                        </div>
                        <div class="card-body">
                            <div class="card-meta"><i class="fas fa-user-friends"></i> ${data.filiacao || "Filiação não inf."}</div>
                            <div class="card-meta"><i class="fas fa-calendar-alt"></i> Atualizado em: ${dataF}</div>
                        </div>
                        <div class="card-actions">
                             <button class="btn-card btn-del" onclick="window.excluirRelatorio('${d.id}')">Excluir</button>
                             <button class="btn-card btn-open" onclick="window.carregar('${d.id}')">Carregar Relatório</button>
                        </div>
                    </div>
                `;
            }
        });

        if(count === 0) lista.innerHTML = '<div class="empty-state"><p>Nenhum resultado para "'+termo+'".</p></div>';

    } catch(e) { console.error(e); lista.innerHTML = "Erro na conexão."; }
};

window.exportarDados = async function() {
    try {
        const snap = await getDocs(collection(db, "relatorios_diagnosticos"));
        let dados = [];
        snap.forEach(doc => dados.push(doc.data()));
        const json = JSON.stringify(dados, null, 2);
        const blob = new Blob([json], {type: "application/json"});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `backup_escolamanain_${new Date().toLocaleDateString().replace(/\//g,'-')}.json`;
        a.click();
    } catch(e) { alert("Erro ao exportar: " + e.message); }
};

window.importarDados = function(input) {
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            if(confirm(`Deseja importar ${dados.length} relatórios?`)) {
                let contador = 0;
                for(const item of dados) {
                    await addDoc(tabelaRelatorios, item);
                    contador++;
                }
                alert(`${contador} relatórios importados com sucesso!`);
                window.executarBusca();
            }
        } catch(err) { alert("Erro ao importar: " + err.message); }
    };
    reader.readAsText(file);
};

window.gerarRelatorioLista = async function() {
    const q = query(tabelaRelatorios, orderBy('estudante', 'asc'));
    const snap = await getDocs(q);
    let html = `<html><head><title>Lista de Alunos</title><style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #333;padding:8px;text-align:left}th{background:#eee}</style></head><body><h2>Relatório Geral de Alunos Avaliados</h2><table><thead><tr><th>Nome do Estudante</th><th>Filiação</th><th>Data Avaliação</th></tr></thead><tbody>`;
    snap.forEach(d => {
        const data = d.data();
        html += `<tr><td>${data.estudante || "-"}</td><td>${data.filiacao || "-"}</td><td>${data.dataAvaliacao ? new Date(data.dataAvaliacao).toLocaleDateString() : "-"}</td></tr>`;
    });
    html += `</tbody></table></body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.print();
};

window.excluirRelatorio = async function(id) {
    if(confirm("Tem certeza que deseja excluir permanentemente este relatório?")) {
        await deleteDoc(doc(tabelaRelatorios, id));
        window.executarBusca();
    }
}

// --- SALVAR / CARREGAR ---
window.salvarRelatorio = async function() {
    const btn = document.querySelector('.verde');
    btn.innerHTML = '...';
    try {
        const dados = {
            escola: document.getElementById('escola').value,
            estudante: document.getElementById('nomeEstudante').value,
            nascimento: document.getElementById('dataNascimento').value,
            idade: document.getElementById('idade').value,
            filiacao: document.getElementById('filiacao').value,
            dataAvaliacao: document.getElementById('dataAvaliacao').value,
            cid: document.getElementById('inputCid').value, // Salva CID
            medicacao: document.getElementById('inputMedicacao').value, // Salva Medicação
            txtPedagogica: document.getElementById('txtPedagogica').value,
            txtClinica: document.getElementById('txtClinica').value,
            txtSocial: document.getElementById('txtSocial').value,
            txtConclusao: document.getElementById('txtConclusao').value,
            txtIndicacoes: document.getElementById('txtIndicacoes').value,
            txtEncaminhamentos: document.getElementById('txtEncaminhamentos').value,
            txtObservacoes: document.getElementById('txtObservacoes').value,
            idAssPedagogica: document.getElementById('selPedagogica').value,
            idAssPsicologia: document.getElementById('selPsicologia').value,
            idAssSocial: document.getElementById('selSocial').value,
            timestamp: new Date()
        };
        const idDoc = document.getElementById('docId').value;
        if(idDoc) { await updateDoc(doc(tabelaRelatorios, idDoc), dados); alert("Atualizado!"); }
        else { const ref = await addDoc(tabelaRelatorios, dados); document.getElementById('docId').value = ref.id; alert("Salvo!"); }
        
        // Limpa a tela após salvar
        window.novoRelatorio();
        
    } catch(e) { console.error(e); alert("Erro ao salvar."); } 
    finally { btn.innerHTML = '<i class="fas fa-save"></i>'; }
};

window.novoRelatorio = function() {
    document.getElementById('docId').value = "";
    document.querySelectorAll('input').forEach(i => i.value = "");
    document.querySelectorAll('textarea').forEach(t => { 
        if(t.id !== 'txtObservacoes') t.value = ""; // Mantém observações padrão
        else t.value = "A Escola Manain, mantida pelo Centro Ocupacional de Londrina, reafirma seu compromisso...";
        autoResize(t); 
    });
    document.getElementById('inputCid').value = "";
    document.getElementById('inputMedicacao').value = "";
    window.scrollTo(0,0);
};

window.carregar = async function(id) {
    const snap = await getDoc(doc(tabelaRelatorios, id));
    if(snap.exists()) {
        const d = snap.data();
        document.getElementById('docId').value = id;
        
        const campos = ['escola','nomeEstudante','dataNascimento','idade','filiacao','dataAvaliacao',
                        'txtPedagogica','txtClinica','txtSocial','txtConclusao','txtIndicacoes',
                        'txtEncaminhamentos','txtObservacoes'];
        
        campos.forEach(k => { const el = document.getElementById(k); if(el) { el.value = d[k] || ""; autoResize(el); } });
        
        if(d.cid) document.getElementById('inputCid').value = d.cid;
        if(d.medicacao) document.getElementById('inputMedicacao').value = d.medicacao;

        if(d.idAssPedagogica) window.trocarAssinatura('pedagogia', d.idAssPedagogica);
        if(d.idAssPsicologia) window.trocarAssinatura('psicologia', d.idAssPsicologia);
        if(d.idAssSocial) window.trocarAssinatura('social', d.idAssSocial);
        
        window.atualizarDataAssinatura();
        window.fecharModal('modalBusca');
    }
};