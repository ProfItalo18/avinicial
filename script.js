/* =========================================================
   CONFIGURAÇÃO INICIAL E FIREBASE (MANTIDO DO ORIGINAL)
   ========================================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Estado global para controlar qual modal está aberto
let areaAtual = "";

/* =========================================================
   DADOS DOS CHECKLISTS (ESTRUTURA ESCALÁVEL)
   ========================================================= */
// Aqui definimos os itens. Para 60 itens, basta adicionar objetos neste array.
// Cada item tem o texto que aparece na tela (label) e o texto que vai para o relatório (text).

const ESTRUTURA_AREAS = {
    pedagogica: {
        titulo: "Avaliação Pedagógica",
        subsecoes: [
            { nome: "Funções Cognitivas", itens: [
                { label: "Apresenta atenção concentrada", text: "O aluno demonstra boa atenção concentrada nas atividades.", indicacao: "Manter estímulos visuais.", encam: "" },
                { label: "Memória auditiva preservada", text: "Apresenta memória auditiva funcional para comandos simples.", indicacao: "", encam: "Fonoaudiologia se necessário." }
                // ... adicione mais itens até completar a lista
            ]},
            { nome: "Aspectos Acadêmicos", itens: [
                { label: "Reconhece vogais", text: "Reconhece e nomeia as vogais corretamente.", indicacao: "Iniciar junções silábicas.", encam: "" },
                { label: "Realiza contagem até 10", text: "Realiza contagem mecânica até 10.", indicacao: "Jogos numéricos.", encam: "" }
            ]},
            // ... outras subseções (Psicomotores, Habilidades Sociais, Práticas)
        ]
    },
    clinica: {
        titulo: "Avaliação Clínica",
        subsecoes: [
            { nome: "Desempenho Clínico", itens: [
                { label: "Saúde geral estável", text: "Apresenta quadro de saúde geral estável.", indicacao: "Acompanhamento regular.", encam: "" }
            ]},
            { nome: "Medicação", itens: [
                { label: "Faz uso de medicação controlada", text: "Faz uso contínuo de medicação.", indicacao: "Monitorar horários na escola.", encam: "Neuropediatra." }
            ]}
        ]
    },
    social: {
        titulo: "Avaliação Serviço Social",
        subsecoes: [
            { nome: "Contexto Familiar", itens: [
                { label: "Família participativa", text: "A família demonstra-se participativa no processo escolar.", indicacao: "Manter vínculo escola-família.", encam: "" }
            ]},
            { nome: "Rede de Atendimento", itens: [
                { label: "Acompanhado pelo CRAS", text: "Família acompanhada pelo CRAS da região.", indicacao: "", encam: "Solicitar relatório do CRAS." }
            ]}
        ]
    }
};

/* =========================================================
   FUNÇÕES DE UI E LÓGICA
   ========================================================= */

window.calcularIdade = function() {
    const dataNascInput = document.getElementById("dataNascimento").value;
    if (!dataNascInput) return;

    const nascimento = new Date(dataNascInput);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();

    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }

    document.getElementById("idadeCalculada").value = `${idade} anos`;
};

window.abrirModalArea = function(area) {
    areaAtual = area;
    const dados = ESTRUTURA_AREAS[area];
    const modal = document.getElementById("modalChecklist");
    const content = document.getElementById("modalContent");
    const title = document.getElementById("modalTitle");

    title.textContent = dados.titulo;
    content.innerHTML = ""; // Limpa anterior

    // Gera o HTML do checklist dinamicamente
    dados.subsecoes.forEach((sub, subIndex) => {
        const divSub = document.createElement("div");
        divSub.className = "checklist-subsection";
        divSub.innerHTML = `<h4>${sub.nome}</h4>`;

        sub.itens.forEach((item, itemIndex) => {
            // Checkbox com ID único
            const uniqueID = `chk_${area}_${subIndex}_${itemIndex}`;
            divSub.innerHTML += `
                <div class="checklist-item">
                    <input type="checkbox" id="${uniqueID}" 
                        data-text="${item.text}" 
                        data-ind="${item.indicacao}" 
                        data-enc="${item.encam}">
                    <label for="${uniqueID}">${item.label}</label>
                </div>
            `;
        });
        content.appendChild(divSub);
    });

    modal.style.display = "flex";
};

window.fecharModalArea = function() {
    document.getElementById("modalChecklist").style.display = "none";
};

window.confirmarChecklist = function() {
    // Coleta todos os checkboxes marcados no modal aberto
    const checks = document.querySelectorAll(`#modalContent input[type="checkbox"]:checked`);
    
    let textoRelatorio = "";
    let textoIndicacoes = "";
    let textoEncaminhamentos = "";

    checks.forEach(chk => {
        if(chk.dataset.text) textoRelatorio += chk.dataset.text + " ";
        if(chk.dataset.ind) textoIndicacoes += chk.dataset.ind + " ";
        if(chk.dataset.enc) textoEncaminhamentos += chk.dataset.enc + " ";
    });

    // Preenche a área correspondente
    if (areaAtual === 'pedagogica') {
        document.getElementById("textoPedagogico").value = textoRelatorio;
        // Adiciona às indicações globais
        addTextToField("indicacoesPedagogicas", textoIndicacoes);
    } else if (areaAtual === 'clinica') {
        document.getElementById("textoClinico").value = textoRelatorio;
    } else if (areaAtual === 'social') {
        document.getElementById("textoSocial").value = textoRelatorio;
    }

    // Adiciona aos encaminhamentos globais e Conclusão
    addTextToField("encaminhamentosGerais", textoEncaminhamentos);
    addTextToField("conclusaoDiagnostica", textoRelatorio); // Exemplo: Conclusão soma tudo

    fecharModalArea();
};

// Função auxiliar para não apagar o que já estava escrito
function addTextToField(fieldId, newText) {
    if (!newText.trim()) return;
    const field = document.getElementById(fieldId);
    if (field.value.trim()) {
        field.value += "\n" + newText;
    } else {
        field.value = newText;
    }
}

window.trocarAssinatura = function(tipo, valor) {
    if (tipo === 'pedagogica') {
        const img = document.getElementById("imgPedagogica");
        // Ajuste os nomes dos arquivos conforme suas imagens reais
        img.src = (valor === "1") ? "asspedagoga.png" : "asspedagoga2.png";
    } else if (tipo === 'social') {
        const img = document.getElementById("imgSocial");
        img.src = (valor === "1") ? "asssocial.png" : "asssocial2.png";
    }
};

window.salvarNovoRelatorioNoBanco = async function() {
    // Lógica simplificada de salvamento
    try {
        const docRef = await addDoc(collection(db, "relatorios"), {
            estudante: document.getElementById("nomeEstudante").value,
            data: new Date(),
            // ... adicione outros campos conforme necessário
        });
        alert("Relatório salvo com ID: " + docRef.id);
    } catch (e) {
        console.error("Erro ao salvar: ", e);
        alert("Erro ao salvar.");
    }
};