import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- CONFIGURAÇÃO FIREBASE (Mantenha seus dados aqui) ---
const firebaseConfig = {
  apiKey: "SUA_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_ID",
  storageBucket: "SEU_BUCKET",
  messagingSenderId: "SEU_SENDER",
  appId: "SEU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- DADOS DA EQUIPE (Certifique-se que os nomes dos arquivos .png estão corretos) ---
const EQUIPE = {
    pedagogia: {
        'ped1': { nome: "Jheniffer Cavalheiro André", cargo: "Coord. Pedagógica", registro: "RG 9.727.432-0", img: "asspedagoda.png" },
        'ped2': { nome: "Isabella Floripes Sanches", cargo: "Coord. Pedagógica", registro: "RG 10.617.697-3", img: "asspedagoda2.png" }
    },
    psicologia: {
        'psi1': { nome: "Jaqueline Gonçalves Malaquim", cargo: "Psicóloga Escolar", registro: "CRP 08/30548", img: "asspsicologa.png" },
        'psi2': { nome: "Sem Assinatura", cargo: "Psicóloga", registro: "", img: "" }
    },
    social: {
        'soc1': { nome: "Andrea Cristina Santos", cargo: "Assistente Social", registro: "CRESS/PR 9794", img: "asssocial.png" },
        'soc2': { nome: "Sem Assinatura", cargo: "Assistente Social", registro: "", img: "" }
    }
};

// --- DADOS DO CHECKLIST (Exemplo Simplificado) ---
const CHECKLIST = {
    pedagogica: ["Reconhece cores", "Lê vogais", "Escreve o nome", "Interage com colegas"],
    clinica: ["Boa coordenação motora", "Usa óculos", "Desenvolvimento típico"],
    social: ["Família participativa", "Recebe BPC", "Vínculo fortalecido"]
};

let areaAtual = "";

// =========================================================
// FUNÇÕES EXPOSTAS PARA O WINDOW (Isso corrige o erro dos botões)
// =========================================================

// 1. Função para Abrir o Modal de Checklist
window.abrirModal = function(area) {
    areaAtual = area;
    const modal = document.getElementById('modalChecklist');
    const corpo = document.getElementById('corpoChecklist');
    const txtPreview = document.getElementById('textoAoVivo');
    const idTextArea = area === 'pedagogica' ? 'txtPedagogica' : area === 'clinica' ? 'txtClinica' : 'txtSocial';
    
    // Configura Título
    document.getElementById('tituloModal').innerText = "Checklist: " + area.toUpperCase();
    
    // Carrega texto existente
    txtPreview.value = document.getElementById(idTextArea).value;

    // Gera itens do checklist
    corpo.innerHTML = "";
    const itens = CHECKLIST[area] || ["Sem itens cadastrados"];
    
    itens.forEach((item, index) => {
        const div = document.createElement('div');
        div.style.marginBottom = "8px";
        div.innerHTML = `
            <input type="checkbox" id="chk_${index}" value="${item}" onchange="window.atualizarPreview()">
            <label for="chk_${index}">${item}</label>
        `;
        corpo.appendChild(div);
    });

    modal.style.display = 'flex'; // Torna visível
};

// 2. Atualiza o texto conforme marca os checkboxes
window.atualizarPreview = function() {
    const checks = document.querySelectorAll('#corpoChecklist input:checked');
    let texto = [];
    checks.forEach(c => texto.push(c.value + "."));
    document.getElementById('textoAoVivo').value = texto.join(" ");
};

// 3. Confirma e fecha o modal
window.confirmarChecklist = function() {
    const textoFinal = document.getElementById('textoAoVivo').value;
    const idTextArea = areaAtual === 'pedagogica' ? 'txtPedagogica' : areaAtual === 'clinica' ? 'txtClinica' : 'txtSocial';
    document.getElementById(idTextArea).value = textoFinal;
    window.fecharModal('modalChecklist');
};

window.fecharModal = function(id) {
    document.getElementById(id).style.display = 'none';
};

// 4. LÓGICA DE ASSINATURAS (Corrigida)
window.trocarAssinatura = function(categoria, chave) {
    // Pega os dados do objeto EQUIPE
    const dados = EQUIPE[categoria][chave];
    if (!dados) return;

    // Define o sufixo do ID (ex: "Pedagogica", "Psicologia")
    let sufixo = "";
    if (categoria === 'pedagogia') sufixo = "Pedagogica";
    if (categoria === 'psicologia') sufixo = "Psicologia";
    if (categoria === 'social') sufixo = "Social";

    // Pega os elementos do HTML
    const elNome = document.getElementById(`nome${sufixo}`);
    const elCargo = document.getElementById(`cargo${sufixo}`);
    const elReg = document.getElementById(`reg${sufixo}`);
    const elImg = document.getElementById(`img${sufixo}`);

    // Atualiza Texto
    if (elNome) elNome.innerText = dados.nome;
    if (elCargo) elCargo.innerText = dados.cargo;
    if (elReg) elReg.innerText = dados.registro;

    // Atualiza Imagem (se existir)
    if (elImg) {
        if (dados.img && dados.img !== "") {
            elImg.src = dados.img;
            elImg.style.display = "block";
        } else {
            elImg.style.display = "none"; // Esconde se não tiver imagem
        }
    }
};

// 5. Utilitários de Data e Idade
window.calcularIdade = function() {
    const d = document.getElementById('dataNascimento').value;
    if(!d) return;
    const hoje = new Date();
    const nasc = new Date(d);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    document.getElementById('idade').value = idade + " anos";
};

window.atualizarDataAssinatura = function() {
    const input = document.getElementById('dataAvaliacao').value;
    const texto = document.getElementById('localDataTexto');
    if(!input) return;
    const date = new Date(input + 'T12:00:00'); // Fuso horário seguro
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    texto.innerText = `Londrina/PR, ${date.toLocaleDateString('pt-BR', options)}.`;
};

// --- INICIALIZAÇÃO AO CARREGAR A PÁGINA ---
window.addEventListener('load', () => {
    // Popula os Selects com as opções da equipe
    preencherSelect('selPedagogica', EQUIPE.pedagogia);
    preencherSelect('selPsicologia', EQUIPE.psicologia);
    preencherSelect('selSocial', EQUIPE.social);

    // Define valores padrão para aparecerem logo de cara
    document.getElementById('selPedagogica').value = 'ped1';
    window.trocarAssinatura('pedagogia', 'ped1');

    document.getElementById('selPsicologia').value = 'psi1';
    window.trocarAssinatura('psicologia', 'psi1');

    document.getElementById('selSocial').value = 'soc1';
    window.trocarAssinatura('social', 'soc1');
    
    // Auto-expandir textareas
    document.querySelectorAll('textarea').forEach(tx => {
        tx.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });
});

function preencherSelect(idSelect, objDados) {
    const select = document.getElementById(idSelect);
    select.innerHTML = "";
    for (const [key, val] of Object.entries(objDados)) {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = val.nome || key;
        select.appendChild(opt);
    }
}