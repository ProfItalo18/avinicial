/* =========================================================
   1. CONFIGURAÇÃO DO FIREBASE E IMPORTS
   ========================================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- SUBSTITUA COM SUAS CREDENCIAIS DO FIREBASE CONSOLE ---
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_PROJETO.firebasestorage.app",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const relatoriosRef = collection(db, "relatorios_diagnosticos");

let areaAtualAberta = null;

/* =========================================================
   2. DADOS DO CHECKLIST DIAGNÓSTICO (APROFUNDADO)
   Baseado em pré-requisitos e análise funcional (Anexo 2)
   ========================================================= */
const DADOS_CHECKLIST = {
    pedagogica: {
        titulo: "Avaliação Diagnóstica Pedagógica",
        subsecoes: [
            { 
                nome: "1. Pré-requisitos para Aprendizagem (Funções Executivas Básicas)", 
                itens: [
                    { label: "Atenção Seletiva e Sustentada", texto: "Demonstra capacidade de focar a atenção em estímulos relevantes e sustentá-la durante a execução de tarefas curtas, com mediação.", ind: "Atividades de curta duração com aumento gradual de tempo; uso de pistas visuais para manter o foco.", enc: "" },
                    { label: "Controle Inibitório Inicial", texto: "Apresenta controle inibitório em desenvolvimento, conseguindo aguardar sua vez em situações estruturadas na maior parte do tempo.", ind: "Jogos de regras simples que exijam esperar a vez; reforço positivo para comportamentos de espera.", enc: "" },
                    { label: "Memória de Trabalho (Comandos)", texto: "Compreende e executa sequências de até dois comandos verbais simples sem suporte visual imediato.", ind: "Solicitar execução de tarefas em etapas, aumentando a complexidade gradualmente.", enc: "" }
                ]
            },
            { 
                nome: "2. Habilidades Acadêmicas Iniciais (Letramento e Numeramento)", 
                itens: [
                    { label: "Consciência Fonológica (Rimas/Aliterações)", texto: "Identifica sons iniciais e finais semelhantes em palavras (rimas e aliterações) com apoio oral.", ind: "Explorar parlendas, músicas e jogos de rimas.", enc: "" },
                    { label: "Hipótese de Escrita (Pré-silábica/Silábica)", texto: "Encontra-se em transição da hipótese pré-silábica para silábica, começando a relacionar a pauta sonora à quantidade de grafias.", ind: "Atividades de escrita espontânea com intervenção pontual; uso de letras móveis.", enc: "" },
                    { label: "Contagem e Quantificação (até 10)", texto: "Realiza contagem termo a termo e relaciona número à quantidade em conjuntos de até 10 elementos.", ind: "Jogos concretos de contagem, pareamento de número e quantidade.", enc: "" }
                ]
            },
            // ... CONTINUE EXPANDINDO: Coordenação Visomotora, Raciocínio Lógico, etc.
        ]
    },
    clinica: {
        titulo: "Avaliação Diagnóstica Clínica",
        subsecoes: [
            { 
                nome: "1. Desenvolvimento Neuropsicomotor e Sensorial", 
                itens: [
                    { label: "Coordenação Motora Global", texto: "Apresenta padrão de marcha estável e bom equilíbrio estático e dinâmico para a idade.", ind: "Circuitos motores e atividades ao ar livre.", enc: "" },
                    { label: "Processamento Sensorial (Hipersensibilidade)", texto: "Demonstra sinais de hipersensibilidade auditiva a ruídos intensos do ambiente escolar.", ind: "Uso de abafadores em momentos de pico de ruído; dessensibilização gradual.", enc: "Avaliação de Terapia Ocupacional (Integração Sensorial)." }
                ]
            },
            { 
                nome: "2. Comunicação e Linguagem (Aspectos Funcionais)", 
                itens: [
                    { label: "Linguagem Expressiva (Vocabulário)", texto: "Utiliza vocabulário funcional para expressar necessidades básicas e desejos.", ind: "Estimular a ampliação do vocabulário através de nomeação e narrativas.", enc: "" },
                    { label: "Intenção Comunicativa", texto: "Demonstra clara intenção comunicativa, buscando interação com pares e adultos através de gestos ou fala.", ind: "Criar situações que exijam comunicação para obter itens desejados.", enc: "" }
                ]
            }
            // ... CONTINUE EXPANDINDO: Saúde Geral, Sono, Alimentação, Autonomia nas AVDs.
        ]
    },
    social: {
        titulo: "Avaliação Diagnóstica Serviço Social",
        subsecoes: [
            { 
                nome: "1. Dinâmica e Estrutura Familiar", 
                itens: [
                    { label: "Rede de Apoio Familiar", texto: "O estudante conta com uma rede de apoio familiar estruturada e presente no acompanhamento escolar.", ind: "Manter comunicação constante via agenda/reuniões.", enc: "" },
                    { label: "Compreensão do Diagnóstico pela Família", texto: "A família demonstra compreensão adequada sobre as necessidades específicas do estudante.", ind: "Oferecer escuta ativa e orientações pontuais sobre o desenvolvimento.", enc: "" }
                ]
            },
            { 
                nome: "2. Acesso a Direitos e Rede Socioassistencial", 
                itens: [
                    { label: "Benefício de Prestação Continuada (BPC)", texto: "A família é beneficiária do BPC.", ind: "", enc: "Orientar sobre a atualização do CadÚnico se necessário." },
                    { label: "Acompanhamento na Rede de Saúde", texto: "Realiza acompanhamentos regulares na UBS e serviços especializados (ex: CAPSij, CER).", ind: "Solicitar cópia dos relatórios médicos atualizados.", enc: "" }
                ]
            }
             // ... CONTINUE EXPANDINDO: Habitação, Vulnerabilidades, Transporte.
        ]
    }
};

/* =========================================================
   3. FUNÇÕES DE LÓGICA E INTERFACE (UI)
   ========================================================= */

// Cálculo de Idade
window.calcularIdade = function() {
    const dataNascStr = document.getElementById("dataNascimento").value;
    if (!dataNascStr) return;

    const nasc = new Date(dataNascStr);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();

    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
        idade--;
    }
    document.getElementById("idadeCalculada").value = `${idade} anos`;
};

// Controle de Modais (Genérico)
window.abrirModal = function(modalId) {
    document.getElementById(modalId).style.display = "flex";
}

window.fecharModal = function(modalId) {
    document.getElementById(modalId).style.display = "none";
    if (modalId === 'modalAvaliacaoOverlay') areaAtualAberta = null;
}

// Modal de Avaliação (Checklist)
window.abrirModalAvaliacao = function(area) {
    areaAtualAberta = area;
    const dados = DADOS_CHECKLIST[area];
    const modalTitle = document.getElementById("modalAvaliacaoTitle");
    const modalBody = document.getElementById("modalChecklistBody");

    modalTitle.textContent = dados.titulo;
    modalBody.innerHTML = ""; // Limpa conteúdo anterior

    // Gera o HTML do checklist
    dados.subsecoes.forEach((sub, idxSub) => {
        const divSub = document.createElement("div");
        divSub.className = "checklist-group";
        divSub.innerHTML = `<h4>${sub.nome}</h4>`;

        sub.itens.forEach((item, idxItem) => {
            const uniqueId = `chk_${area}_${idxSub}_${idxItem}`;
            divSub.innerHTML += `
                <div class="check-item">
                    <input type="checkbox" id="${uniqueId}" 
                           data-texto="${item.texto}" 
                           data-ind="${item.ind}" 
                           data-enc="${item.enc}">
                    <label for="${uniqueId}">${item.label}</label>
                </div>
            `;
        });
        modalBody.appendChild(divSub);
    });

    abrirModal('modalAvaliacaoOverlay');
};

// Processa o Checklist e Gera Textos
window.processarChecklist = function() {
    if (!areaAtualAberta) return;

    const checks = document.querySelectorAll("#modalChecklistBody input:checked");
    
    let textoSintese = [];
    let textoInd = [];
    let textoEnc = [];

    checks.forEach(chk => {
        if (chk.dataset.texto && chk.dataset.texto.trim() !== "") textoSintese.push(chk.dataset.texto);
        if (chk.dataset.ind && chk.dataset.ind.trim() !== "") textoInd.push(chk.dataset.ind);
        if (chk.dataset.enc && chk.dataset.enc.trim() !== "") textoEnc.push(chk.dataset.enc);
    });

    // 1. Preenche a área específica (Substitui o texto existente para facilitar correções)
    const idCampoTextoArea = areaAtualAberta === 'pedagogica' ? 'textoPedagogico' :
                             areaAtualAberta === 'clinica' ? 'textoClinico' : 'textoSocial';
    
    // Junta os textos com espaço e adiciona um ponto final se não tiver.
    let textoFinalArea = textoSintese.join(" ");
    if (textoFinalArea && !textoFinalArea.endsWith('.')) textoFinalArea += '.';
    document.getElementById(idCampoTextoArea).value = textoFinalArea;


    // 2. Adiciona aos campos Globais (Indicações e Encaminhamentos) - Usando Append com marcador
    if (textoInd.length > 0) {
        adicionarTextoComMarcador('indicacoesPedagogicas', textoInd);
    }
    
    if (textoEnc.length > 0) {
        adicionarTextoComMarcador('encaminhamentosGerais', textoEnc);
    }

    fecharModal('modalAvaliacaoOverlay');
    alert("Textos gerados com sucesso! Revise e edite conforme necessário.");
};

// Função auxiliar para adicionar listas com marcador "•"
function adicionarTextoComMarcador(idCampo, arrayTextos) {
    const campo = document.getElementById(idCampo);
    let textoAtual = campo.value;
    
    // Se já tem texto e não termina com quebra de linha, adiciona uma.
    if (textoAtual && !textoAtual.endsWith('\n')) {
        textoAtual += '\n';
    }

    // Adiciona os novos itens com marcador, evitando duplicatas exatas
    arrayTextos.forEach(item => {
        if (!textoAtual.includes(item)) {
             textoAtual += `• ${item}\n`;
        }
    });

    campo.value = textoAtual;
}

// Troca de Assinaturas
window.mudarAssinatura = function(tipo, valor) {
    let imgId = tipo === 'pedagogica' ? 'sigImgPedagogica' : 'sigImgSocial';
    let nomeBase = tipo === 'pedagogica' ? 'asspedagoga' : 'asssocial';
    
    // Se valor for "1", usa o nome base. Se for "2", usa base + "2".
    let sulfixo = (valor === "2") ? "2" : "";
    
    document.getElementById(imgId).src = `${nomeBase}${sulfixo}.png`;
};


/* =========================================================
   4. INTEGRAÇÃO COM FIREBASE (SALVAR, BUSCAR, CARREGAR, EXCLUIR)
   ========================================================= */

// --- SALVAR ---
window.salvarRelatorioFirebase = async function() {
    const btnSave = document.querySelector('.btn-save');
    btnSave.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btnSave.disabled = true;

    const relatorioId = document.getElementById('relatorioId').value;
    const nomeEstudante = document.getElementById('nomeEstudante').value;

    if (!nomeEstudante) {
        alert("Por favor, preencha o nome do estudante antes de salvar.");
        resetBtnSave(btnSave);
        return;
    }

    // Coleta todos os dados do formulário
    const dadosRelatorio = {
        municipio: document.getElementById('municipio').value,
        nre: document.getElementById('nre').value,
        escola: document.getElementById('escola').value,
        nomeEstudante: nomeEstudante,
        dataNascimento: document.getElementById('dataNascimento').value,
        idadeCalculada: document.getElementById('idadeCalculada').value,
        filiacao: document.getElementById('filiacao').value,
        dataAvaliacao: document.getElementById('dataAvaliacao').value,
        
        textoPedagogico: document.getElementById('textoPedagogico').value,
        textoClinico: document.getElementById('textoClinico').value,
        textoSocial: document.getElementById('textoSocial').value,
        
        conclusaoDiagnostica: document.getElementById('conclusaoDiagnostica').value,
        indicacoesPedagogicas: document.getElementById('indicacoesPedagogicas').value,
        encaminhamentosGerais: document.getElementById('encaminhamentosGerais').value,
        
        selPedagogica: document.getElementById('selPedagogica').value,
        selSocial: document.getElementById('selSocial').value,

        ultimaAtualizacao: new Date() // Timestamp para ordenação
    };

    try {
        if (relatorioId) {
            // Atualizar existente
            await updateDoc(doc(db, "relatorios_diagnosticos", relatorioId), dadosRelatorio);
            alert("Relatório atualizado com sucesso!");
        } else {
            // Criar novo
            const docRef = await addDoc(relatoriosRef, dadosRelatorio);
            document.getElementById('relatorioId').value = docRef.id; // Salva o ID no hidden input
            alert("Novo relatório salvo com sucesso!");
        }
    } catch (e) {
        console.error("Erro ao salvar documento: ", e);
        alert("Erro ao salvar o relatório. Verifique o console.");
    } finally {
        resetBtnSave(btnSave);
    }
};

function resetBtnSave(btn) {
    btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i>';
    btn.disabled = false;
}

// --- BUSCAR (Abrir Modal e Listar) ---
window.abrirModalBusca = function() {
    abrirModal('modalBuscaOverlay');
    buscarRelatorios(); // Carrega a lista inicial (todos ou os últimos)
};

window.buscarRelatorios = async function() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const resultsList = document.getElementById('searchResultsList');
    resultsList.innerHTML = '<p class="loading-text"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>';

    try {
        // Busca simples: pega tudo e filtra no cliente (ideal para poucos registros).
        // Para muitos registros, usar "where" do Firestore (mas requer índice composto para 'nome' + 'data').
        const q = query(relatoriosRef, orderBy("ultimaAtualizacao", "desc"));
        const querySnapshot = await getDocs(q);
        
        resultsList.innerHTML = ''; // Limpa loading

        if (querySnapshot.empty) {
            resultsList.innerHTML = '<p class="loading-text">Nenhum relatório encontrado.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Filtro no cliente (case-insensitive)
            if (searchTerm === "" || data.nomeEstudante.toLowerCase().includes(searchTerm)) {
                
                const dataFormatada = data.ultimaAtualizacao ? new Date(data.ultimaAtualizacao.seconds * 1000).toLocaleDateString('pt-BR') : 'Data desc.';

                const itemDiv = document.createElement('div');
                itemDiv.className = 'result-item';
                itemDiv.innerHTML = `
                    <div class="result-info">
                        <strong>${data.nomeEstudante}</strong>
                        <span>Atualizado em: ${dataFormatada}</span>
                    </div>
                    <div class="result-actions">
                        <button class="btn-load" onclick="carregarRelatorio('${doc.id}')"><i class="fas fa-edit"></i> Carregar</button>
                        <button class="btn-delete" onclick="excluirRelatorio('${doc.id}', '${data.nomeEstudante}')"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                resultsList.appendChild(itemDiv);
            }
        });

        if (resultsList.children.length === 0) {
             resultsList.innerHTML = '<p class="loading-text">Nenhum relatório encontrado para essa busca.</p>';
        }

    } catch (e) {
        console.error("Erro ao buscar: ", e);
        resultsList.innerHTML = '<p class="loading-text error">Erro ao buscar relatórios.</p>';
    }
};


// --- CARREGAR ---
window.carregarRelatorio = async function(id) {
    try {
        const docRef = doc(db, "relatorios_diagnosticos", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Preenche os campos do formulário com os dados do banco
            document.getElementById('relatorioId').value = id;
            document.getElementById('municipio').value = data.municipio;
            document.getElementById('nre').value = data.nre;
            document.getElementById('escola').value = data.escola;
            document.getElementById('nomeEstudante').value = data.nomeEstudante;
            document.getElementById('dataNascimento').value = data.dataNascimento;
            document.getElementById('idadeCalculada').value = data.idadeCalculada;
            document.getElementById('filiacao').value = data.filiacao;
            document.getElementById('dataAvaliacao').value = data.dataAvaliacao;
            
            document.getElementById('textoPedagogico').value = data.textoPedagogico;
            document.getElementById('textoClinico').value = data.textoClinico;
            document.getElementById('textoSocial').value = data.textoSocial;
            
            document.getElementById('conclusaoDiagnostica').value = data.conclusaoDiagnostica;
            document.getElementById('indicacoesPedagogicas').value = data.indicacoesPedagogicas;
            document.getElementById('encaminhamentosGerais').value = data.encaminhamentosGerais;

            // Define os selects das assinaturas e dispara o evento para mudar a imagem
            const selPed = document.getElementById('selPedagogica');
            selPed.value = data.selPedagogica || "1";
            selPed.dispatchEvent(new Event('change'));

            const selSoc = document.getElementById('selSocial');
            selSoc.value = data.selSocial || "1";
            selSoc.dispatchEvent(new Event('change'));
            
            fecharModal('modalBuscaOverlay');
            alert(`Relatório de "${data.nomeEstudante}" carregado.`);

        } else {
            alert("Relatório não encontrado!");
        }
    } catch (e) {
        console.error("Erro ao carregar: ", e);
        alert("Erro ao carregar o relatório.");
    }
};


// --- EXCLUIR ---
window.excluirRelatorio = async function(id, nome) {
    if (confirm(`Tem certeza que deseja excluir o relatório de "${nome}"? Esta ação não pode ser desfeita.`)) {
        try {
            await deleteDoc(doc(db, "relatorios_diagnosticos", id));
            // Se o relatório excluído era o que estava na tela, limpa o ID oculto
            if (document.getElementById('relatorioId').value === id) {
                document.getElementById('relatorioId').value = "";
                // Opcional: Limpar todo o formulário também
            }
            alert("Relatório excluído com sucesso.");
            buscarRelatorios(); // Atualiza a lista
        } catch (e) {
            console.error("Erro ao excluir: ", e);
            alert("Erro ao excluir o relatório.");
        }
    }
};