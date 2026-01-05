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

// --- 2. PERFIS DE ASSINATURA (EDITE AQUI) ---
const PERFIS = {
    pedagogica: [
        { id: '1', nome: 'Maria da Silva', cargo: 'Coordenação Pedagógica', img: 'asspedagoga.png' },
        { id: '2', nome: 'Joana Oliveira', cargo: 'Pedagoga / AEE', img: 'asspedagoga2.png' }
    ],
    social: [
        { id: '1', nome: 'Ana Paula Souza', cargo: 'Assistente Social', img: 'asssocial.png' },
        { id: '2', nome: 'Fernanda Lima', cargo: 'Assistente Social - CRESS 1234', img: 'asssocial2.png' }
    ]
};

// --- 3. CHECKLIST DIAGNÓSTICO (ANEXO 2) ---
const DADOS_CHECKLIST = {
    pedagogica: {
        titulo: "1.2 Avaliação Pedagógica e Funcional (Educação Especial)",
        grupos: [
            {
                nome: "Habilidades Funcionais e Vida Diária (AVDs)",
                itens: [
                    { label: "Uso do Banheiro", txt: "Uso de fraldas/não tem controle esfincteriano.", ind: "Treino de desfralde/Trocas regulares.", enc: "Enfermagem/Família" },
                    { label: "Alimentação Autônoma", txt: "Não consegue levar o alimento à boca ou usar talheres.", ind: "Uso de engrossadores/Colher adaptada.", enc: "Terapia Ocupacional" },
                    { label: "Higiene Pessoal na Escola", txt: "Dificuldade em lavar mãos/rosto sem auxílio físico.", ind: "Apoio físico e dicas visuais no espelho.", enc: "Terapia Ocupacional" },
                    { label: "Vestuário", txt: "Dificuldade com botões, zíperes ou calçados.", ind: "Uso de velcro/Treino de abotoadura.", enc: "Terapia Ocupacional" },
                    { label: "Locomoção na Escola", txt: "Não se localiza nos ambientes da escola (refeitório/sala).", ind: "Pistas visuais no chão/paredes.", enc: "Orientação e Mobilidade" }
                ]
            },
            {
                nome: "Comunicação Aumentativa e Alternativa (CAA)",
                itens: [
                    { label: "Oralidade Funcional", txt: "Emite sons, mas sem função comunicativa clara.", ind: "Estimulação de intenção comunicativa.", enc: "Fonoaudiologia" },
                    { label: "Compreensão de Comandos", txt: "Compreende apenas comandos com apoio gestual.", ind: "Sempre associar fala a gestos.", enc: "Fonoaudiologia" },
                    { label: "Uso de PECs/Imagens", txt: "Não utiliza ou não tem prancha de comunicação.", ind: "Implementação de PECs/Prancha.", enc: "Fonoaudiologia/Pedagogia" },
                    { label: "Comunicação Não-Verbal", txt: "Comunica-se apenas por choro ou agressividade.", ind: "Mapeamento da função do comportamento.", enc: "Psicologia Comportamental" },
                    { label: "Inteligibilidade", txt: "Fala presente, mas ininteligível para estranhos.", ind: "Uso de pistas de contexto.", enc: "Fonoaudiologia" }
                ]
            },
            {
                nome: "Cognição e Currículo Funcional (DI)",
                itens: [
                    { label: "Letramento de Sobrevivência", txt: "Não reconhece placas de perigo, banheiros ou saídas.", ind: "Leitura incidental (rótulos, placas).", enc: "Psicopedagogia" },
                    { label: "Uso do Dinheiro", txt: "Não reconhece valor de cédulas/moedas.", ind: "Simulação de compra/venda.", enc: "Pedagogia" },
                    { label: "Noção Temporal", txt: "Não compreende ontem/hoje/amanhã ou relógio.", ind: "Rotina visual linear e calendário.", enc: "Pedagogia" },
                    { label: "Pareamento/Classificação", txt: "Dificuldade em agrupar itens (cor, forma, função).", ind: "Atividades com objetos concretos.", enc: "Psicopedagogia" },
                    { label: "Memória Operacional", txt: "Esquece a instrução no meio da execução.", ind: "Instruções curtas e segmentadas.", enc: "Neuropsicologia" },
                    { label: "Alfabetização (Nível)", txt: "Pré-silábico: Não associa escrita à fala.", ind: "Consciência fonológica inicial.", enc: "Psicopedagogia" }
                ]
            },
            {
                nome: "Socialização e Comportamento Adaptativo",
                itens: [
                    { label: "Regras Sociais", txt: "Comportamento inadequado em público (ex: despir-se).", ind: "Histórias sociais e modelagem.", enc: "Psicologia" },
                    { label: "Percepção de Perigo", txt: "Não avalia riscos (altura, carros, quente/frio).", ind: "Supervisão constante 1:1.", enc: "Família/Monitoria" },
                    { label: "Interação com Pares", txt: "Isolamento passivo ou agressividade reativa.", ind: "Mediação de brincadeiras.", enc: "Psicologia" },
                    { label: "Estereotipias Motoras", txt: "Movimentos que impedem a realização da tarefa.", ind: "Redirecionamento motor.", enc: "T.O./Psicologia" },
                    { label: "Autoagressão", txt: "Morde-se ou bate a cabeça quando frustrado.", ind: "Proteção física e análise funcional.", enc: "Psiquiatria/Psicologia" }
                ]
            }
        ]
    },
    clinica: {
        titulo: "1.3 Avaliação Clínica e de Reabilitação (Saúde/SUS)",
        grupos: [
            {
                nome: "Neurológico e Comorbidades",
                itens: [
                    { label: "Epilepsia/Convulsões", txt: "Histórico de crises frequentes ou ausências.", ind: "Protocolo de crise na sala.", enc: "Neurologista" },
                    { label: "Controle Medicamentoso", txt: "Sonolência excessiva devido à medicação.", ind: "Ajuste de horário de atividades.", enc: "Neurologista/Psiquiatra" },
                    { label: "Transtornos do Sono", txt: "Troca o dia pela noite ou insônia severa.", ind: "Higiene do sono.", enc: "Neurologista" },
                    { label: "Cefaleia/Dores", txt: "Queixa frequente de dores sem causa aparente.", ind: "Investigação clínica.", enc: "Pediatria/Clínico Geral" },
                    { label: "Tiques/Tourette", txt: "Tiques motores ou vocais involuntários.", ind: "Não punir/Ignorar tique.", enc: "Neurologista" }
                ]
            },
            {
                nome: "Físico, Motor e Mobilidade (Fisioterapia)",
                itens: [
                    { label: "Uso de Cadeira de Rodas", txt: "Dependente para transferência e locomoção.", ind: "Adaptação do mobiliário escolar.", enc: "Fisioterapia" },
                    { label: "Marcha/Andar", txt: "Marcha instável, na ponta dos pés ou com apoio.", ind: "Treino de marcha/Equilíbrio.", enc: "Fisioterapia/Ortopedia" },
                    { label: "Espasticidade/Rigidez", txt: "Membros rígidos, dificultando higiene/atividades.", ind: "Alongamento passivo/Órteses.", enc: "Fisioterapia/T.O." },
                    { label: "Deformidades Ósseas", txt: "Escoliose severa ou deformidades em mãos/pés.", ind: "Posicionamento adequado na cadeira.", enc: "Ortopedia" },
                    { label: "Controle de Tronco/Cewfalico", txt: "Não sustenta a cabeça ou cai para o lado.", ind: "Uso de colar cervical/adaptação.", enc: "Fisioterapia" }
                ]
            },
            {
                nome: "Sensorial e Terapia Ocupacional",
                itens: [
                    { label: "Hipersensibilidade Auditiva", txt: "Desorganização extrema com barulho.", ind: "Uso de abafadores.", enc: "Terapia Ocupacional" },
                    { label: "Busca Sensorial", txt: "Leva tudo à boca ou busca pressão profunda.", ind: "Mordedores de silicone.", enc: "Terapia Ocupacional" },
                    { label: "Seletividade Alimentar", txt: "Restrição severa (risco nutricional).", ind: "Dessensibilização alimentar.", enc: "Fono/Nutrição" },
                    { label: "Coordenação Visomotora", txt: "Não consegue seguir objeto com os olhos.", ind: "Estimulação visual com luzes.", enc: "Oftalmologia/T.O." }
                ]
            },
            {
                nome: "Saúde Bucal e Nutricional",
                itens: [
                    { label: "Disfagia (Engasgos)", txt: "Tosse ou engasgo ao comer/beber.", ind: "Espessante alimentar/Postura.", enc: "Fonoaudiologia" },
                    { label: "Sialorreia (Babação)", txt: "Excesso de saliva, molha a roupa/mesa.", ind: "Bandana/Exercícios orofaciais.", enc: "Fonoaudiologia" },
                    { label: "Higiene Bucal", txt: "Cáries visíveis ou gengivite.", ind: "Escovação supervisionada.", enc: "Odontologia (CEO)" },
                    { label: "Estado Nutricional", txt: "Baixo peso ou obesidade mórbida.", ind: "Adequação da merenda.", enc: "Nutricionista/Endócrino" },
                    { label: "Respiração", txt: "Respirador oral crônico (adenoide).", ind: "Limpeza nasal.", enc: "Otorrinolaringologista" }
                ]
            }
        ]
    },
    social: {
        titulo: "1.4 Serviço Social e Direitos (Cidadania)",
        grupos: [
            {
                nome: "Acesso a Benefícios e Direitos",
                itens: [
                    { label: "BPC/LOAS", txt: "Família perfil BPC, mas benefício negado ou não solicitado.", ind: "Orientação para recurso/requerimento.", enc: "INSS/Defensoria" },
                    { label: "Transporte Especial", txt: "Necessita de transporte adaptado (ambulância/van).", ind: "Solicitação de transporte sanitário.", enc: "Secretaria de Saúde" },
                    { label: "Curatela/Tutela", txt: "Aluno maior de 18 anos sem curatela definida.", ind: "Orientação jurídica sobre interdição.", enc: "Ministério Público/Defensoria" },
                    { label: "Documentação Civil", txt: "Falta de RG atualizado (necessário p/ benefícios).", ind: "Encaminhar para 2ª via.", enc: "Instituto de Identificação" },
                    { label: "Carteira de Identificação", txt: "Não possui CIPTEA ou carteira da pessoa com deficiência.", ind: "Solicitar emissão.", enc: "Órgão Estadual/Municipal" }
                ]
            },
            {
                nome: "Contexto Familiar e Vulnerabilidade",
                itens: [
                    { label: "Sobrecarga do Cuidador", txt: "Cuidador principal exausto/doente (Burnout).", ind: "Suporte emocional/Grupos.", enc: "Psicologia/CAPS" },
                    { label: "Negligência", txt: "Sinais de falta de higiene, fome ou roupas inadequadas.", ind: "Acompanhamento próximo.", enc: "CREAS/Conselho Tutelar" },
                    { label: "Violência Intrafamiliar", txt: "Suspeita de violência física, psicológica ou sexual.", ind: "Notificação compulsória imediata.", enc: "Conselho Tutelar/Delegacia" },
                    { label: "Uso de Substâncias", txt: "Responsáveis com histórico de drogadição/alcoolismo.", ind: "Redução de danos.", enc: "CAPS AD" },
                    { label: "Rede de Apoio", txt: "Família monoparental sem apoio de parentes.", ind: "Fortalecimento de vínculos comunitários.", enc: "CRAS" }
                ]
            },
            {
                nome: "Habitação e Acessibilidade",
                itens: [
                    { label: "Acessibilidade Domiciliar", txt: "Casa com escadas/barreiras para cadeira de rodas.", ind: "Orientações de adaptação simples.", enc: "Serviço Social/Habitação" },
                    { label: "Insalubridade", txt: "Mofo, falta de ventilação (agravante respiratório).", ind: "Avaliação da moradia.", enc: "Vigilância Sanitária/Social" },
                    { label: "Equipamentos (Órteses)", txt: "Necessita de cadeira de banho/rodas/óculos.", ind: "Prescrição e solicitação ao SUS.", enc: "Centro de Reabilitação (CER)" },
                    { label: "Medicamentos de Alto Custo", txt: "Usa medicação não disponível na farmácia básica.", ind: "Processo administrativo de alto custo.", enc: "Farmácia Especial/MP" }
                ]
            }
        ]
    }
};

// --- 4. FUNÇÕES GLOBAIS (WINDOW) ---

// Auto-Resize Textarea
function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight) + 'px';
}
document.querySelectorAll('textarea').forEach(tx => {
    tx.addEventListener('input', function() { autoResize(this); });
});

// Inicialização: Preenche selects de assinatura
window.addEventListener('load', () => {
    preencherSelect('selPedagogica', PERFIS.pedagogica);
    preencherSelect('selSocial', PERFIS.social);
    // Define padrão
    window.trocarAssinatura('pedagogica', '1');
    window.trocarAssinatura('social', '1');
    window.atualizarDataAssinatura();
});

function preencherSelect(id, lista) {
    const sel = document.getElementById(id);
    sel.innerHTML = "";
    lista.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.nome;
        sel.appendChild(opt);
    });
}

// Lógica de Assinatura (Troca Imagem, Nome e Cargo)
window.trocarAssinatura = function(tipo, id) {
    const lista = PERFIS[tipo];
    const perfil = lista.find(p => p.id === id);
    if(perfil) {
        // Ex: imgPedagogica, nomePedagogica, cargoPedagogica
        const T = tipo.charAt(0).toUpperCase() + tipo.slice(1); // "pedagogica" -> "Pedagogica"
        document.getElementById(`img${T}`).src = perfil.img;
        document.getElementById(`nome${T}`).innerText = perfil.nome;
        document.getElementById(`cargo${T}`).innerText = perfil.cargo;
        // Atualiza o select caso tenha sido chamado via código
        document.getElementById(`sel${T}`).value = id;
    }
};

window.calcularIdade = function() {
    const d = document.getElementById('dataNascimento').value;
    if(!d) return;
    const nasc = new Date(d);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    if(hoje < new Date(hoje.getFullYear(), nasc.getMonth(), nasc.getDate())) idade--;
    document.getElementById('idade').value = `${idade} anos`;
};

window.atualizarDataAssinatura = function() {
    const dtInput = document.getElementById('dataAvaliacao').value;
    const p = document.getElementById('localDataTexto');
    if(!dtInput) {
        p.innerText = "Londrina/PR, ____ de __________________ de _______.";
        return;
    }
    const d = new Date(dtInput);
    // Ajuste de fuso horário simples
    const userTimezoneOffset = d.getTimezoneOffset() * 60000;
    const dataCorreta = new Date(d.getTime() + userTimezoneOffset);
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    p.innerText = `Londrina/PR, ${dataCorreta.toLocaleDateString('pt-BR', options)}.`;
};

// --- MODAIS ---
window.abrirModal = function(area) {
    areaAtual = area;
    const dados = CHECKLIST[area];
    document.getElementById('tituloModal').innerText = dados.titulo;
    const corpo = document.getElementById('corpoChecklist');
    corpo.innerHTML = "";

    dados.grupos.forEach((g, gIdx) => {
        let html = `<div class="check-grupo"><h5>${g.nome}</h5>`;
        g.itens.forEach((it, iIdx) => {
            const idChk = `chk_${area}_${gIdx}_${iIdx}`;
            html += `
                <div class="check-item">
                    <input type="checkbox" id="${idChk}" 
                        data-txt="${it.txt}" data-ind="${it.ind}" data-enc="${it.enc}">
                    <label for="${idChk}">${it.txt}</label>
                </div>`;
        });
        html += `</div>`;
        corpo.innerHTML += html;
    });
    document.getElementById('modalChecklist').style.display = 'flex';
};

window.fecharModal = function(id) { document.getElementById(id).style.display = 'none'; };

window.processarChecklist = function() {
    const checks = document.querySelectorAll('#corpoChecklist input:checked');
    let txt = "", ind = "", enc = "";

    checks.forEach(c => {
        if(c.dataset.txt) txt += c.dataset.txt + " ";
        if(c.dataset.ind) ind += "• " + c.dataset.ind + "\n";
        if(c.dataset.enc) enc += "• " + c.dataset.enc + "\n";
    });

    const idArea = areaAtual === 'pedagogica' ? 'txtPedagogica' : 
                   areaAtual === 'clinica' ? 'txtClinica' : 'txtSocial';
    
    // Insere texto na área
    const elArea = document.getElementById(idArea);
    elArea.value = txt;
    autoResize(elArea);

    // Insere nos globais
    if(txt) {
        const c = document.getElementById('txtConclusao');
        c.value += (c.value ? "\n" : "") + txt;
        autoResize(c);
    }
    if(ind) {
        const i = document.getElementById('txtIndicacoes');
        i.value += (i.value ? "\n" : "") + ind;
        autoResize(i);
    }
    if(enc) {
        const e = document.getElementById('txtEncaminhamentos');
        e.value += (e.value ? "\n" : "") + enc;
        autoResize(e);
    }
    window.fecharModal('modalChecklist');
};

// --- FIREBASE (CRUD) ---
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
            
            txtPedagogica: document.getElementById('txtPedagogica').value,
            txtClinica: document.getElementById('txtClinica').value,
            txtSocial: document.getElementById('txtSocial').value,
            
            txtConclusao: document.getElementById('txtConclusao').value,
            txtIndicacoes: document.getElementById('txtIndicacoes').value,
            txtEncaminhamentos: document.getElementById('txtEncaminhamentos').value,
            txtObservacoes: document.getElementById('txtObservacoes').value,
            
            // Salva os IDs das assinaturas escolhidas
            idAssPedagogica: document.getElementById('selPedagogica').value,
            idAssSocial: document.getElementById('selSocial').value,
            
            timestamp: new Date()
        };

        const idDoc = document.getElementById('docId').value;
        if(idDoc) {
            await updateDoc(doc(tabelaRelatorios, idDoc), dados);
            alert("Atualizado com sucesso!");
        } else {
            const ref = await addDoc(tabelaRelatorios, dados);
            document.getElementById('docId').value = ref.id;
            alert("Salvo com sucesso!");
        }
    } catch(e) {
        console.error(e);
        alert("Erro ao salvar.");
    } finally {
        btn.innerHTML = '<i class="fas fa-save"></i>';
    }
};

window.abrirBusca = function() { document.getElementById('modalBusca').style.display = 'flex'; };

window.executarBusca = async function() {
    const termo = document.getElementById('buscaInput').value.toLowerCase();
    const lista = document.getElementById('listaResultados');
    lista.innerHTML = "Carregando...";
    
    const q = query(tabelaRelatorios, orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    
    lista.innerHTML = "";
    if(snap.empty) { lista.innerHTML = "Nada encontrado."; return; }

    snap.forEach(d => {
        const data = d.data();
        if(data.estudante.toLowerCase().includes(termo)) {
            lista.innerHTML += `
                <div style="padding:10px; border-bottom:1px solid #ddd; display:flex; justify-content:space-between;">
                    <span><b>${data.estudante}</b></span>
                    <button onclick="window.carregar('${d.id}')" style="color:blue; cursor:pointer;">Abrir</button>
                </div>
            `;
        }
    });
};

window.carregar = async function(id) {
    const docRef = doc(tabelaRelatorios, id);
    const snap = await getDoc(docRef);
    if(snap.exists()) {
        const d = snap.data();
        document.getElementById('docId').value = id;
        
        // Campos simples
        const campos = ['escola','nomeEstudante','dataNascimento','idade','filiacao','dataAvaliacao',
                        'txtPedagogica','txtClinica','txtSocial','txtConclusao','txtIndicacoes',
                        'txtEncaminhamentos','txtObservacoes'];
        campos.forEach(k => {
            const el = document.getElementById(k);
            if(el) { el.value = d[k] || ""; autoResize(el); }
        });

        // Assinaturas
        if(d.idAssPedagogica) window.trocarAssinatura('pedagogica', d.idAssPedagogica);
        if(d.idAssSocial) window.trocarAssinatura('social', d.idAssSocial);
        
        window.atualizarDataAssinatura();
        window.fecharModal('modalBusca');
    }
};