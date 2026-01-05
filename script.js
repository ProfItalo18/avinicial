/* =========================================================
   1. CONFIGURAÇÃO DO FIREBASE E IMPORTS
   ========================================================= */
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

/* --- CHECKLIST BASEADO NO ANEXO 2 (DIAGNÓSTICO) --- */
const DADOS_CHECKLIST = {
    pedagogica: {
        titulo: "1.2 Avaliação Pedagógica",
        grupos: [
            {
                nome: "Habilidades Conceituais (Cognitivo e Acadêmico)",
                itens: [
                    { label: "Atenção e Concentração", txt: "O aluno demonstra períodos curtos de atenção.", ind: "Atividades de foco visual.", enc: "" },
                    { label: "Leitura (Vogais/Alfabeto)", txt: "Reconhece as vogais mas ainda não alfabetizado.", ind: "Jogos de letramento.", enc: "" },
                    { label: "Raciocínio Lógico (Números)", txt: "Realiza contagem mecânica até 10.", ind: "Material dourado.", enc: "" }
                ]
            },
            {
                nome: "Habilidades Sociais e Práticas",
                itens: [
                    { label: "Interação com Pares", txt: "Interage bem com outras crianças.", ind: "Trabalho em grupo.", enc: "" },
                    { label: "Autonomia (Higiene/Alimentação)", txt: "Necessita de apoio para higiene pessoal.", ind: "Treino de AVDs.", enc: "" }
                ]
            }
        ]
    },
    clinica: {
        titulo: "1.3 Avaliação Clínica",
        grupos: [
            {
                nome: "Saúde e Desenvolvimento",
                itens: [
                    { label: "Saúde Geral", txt: "Apresenta bom estado geral de saúde.", ind: "", enc: "" },
                    { label: "Coordenação Motora", txt: "Coordenação motora ampla preservada.", ind: "Circuito psicomotor.", enc: "Avaliação T.O." }
                ]
            }
        ]
    },
    social: {
        titulo: "1.4 Serviço Social",
        grupos: [
            {
                nome: "Contexto Familiar",
                itens: [
                    { label: "Estrutura Familiar", txt: "Família nuclear, pais presentes.", ind: "Manter vínculo.", enc: "" },
                    { label: "Vulnerabilidade Social", txt: "Não apresenta sinais de vulnerabilidade aparente.", ind: "", enc: "" }
                ]
            }
        ]
    }
};

/* --- FUNÇÕES GERAIS --- */

// Calcular Idade
window.calcularIdade = function() {
    const dataNasc = document.getElementById("dataNascimento").value;
    if (!dataNasc) return;
    const nasc = new Date(dataNasc);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    if (hoje < new Date(hoje.getFullYear(), nasc.getMonth(), nasc.getDate())) idade--;
    document.getElementById("idade").value = `${idade} anos`;
};

// Trocar Imagem de Assinatura
window.trocarImagem = function(tipo, valor) {
    const idImg = tipo === 'pedagoga' ? 'imgPedagoga' : 'imgSocial';
    const nomeBase = tipo === 'pedagoga' ? 'asspedagoga' : 'asssocial';
    // Se valor for "2", imagem é asspedagoga2.png, senão asspedagoga.png
    const sufixo = valor === "2" ? "2" : "";
    document.getElementById(idImg).src = `${nomeBase}${sufixo}.png`;
};

/* --- MODAIS E CHECKLIST --- */
window.abrirModal = function(tipo) {
    areaAtual = tipo;
    const dados = DADOS_CHECKLIST[tipo];
    document.getElementById('modalTitulo').innerText = dados.titulo;
    
    const divConteudo = document.getElementById('modalConteudo');
    divConteudo.innerHTML = "";

    dados.grupos.forEach((grupo, idxG) => {
        let html = `<div class="check-grupo"><h5>${grupo.nome}</h5>`;
        grupo.itens.forEach((item, idxI) => {
            html += `
                <div class="check-item">
                    <input type="checkbox" id="chk_${idxG}_${idxI}" 
                        data-txt="${item.txt}" data-ind="${item.ind}" data-enc="${item.enc}">
                    <label for="chk_${idxG}_${idxI}">${item.label}</label>
                </div>
            `;
        });
        html += `</div>`;
        divConteudo.innerHTML += html;
    });

    document.getElementById('modalChecklist').style.display = 'flex';
};

window.fecharModal = function(id) {
    document.getElementById(id).style.display = 'none';
};

window.processarChecklist = function() {
    const checks = document.querySelectorAll('#modalConteudo input:checked');
    let texto = "";
    let indicacoes = "";
    let encaminhamentos = "";

    checks.forEach(c => {
        if(c.dataset.txt) texto += c.dataset.txt + " ";
        if(c.dataset.ind) indicacoes += "• " + c.dataset.ind + "\n";
        if(c.dataset.enc) encaminhamentos += "• " + c.dataset.enc + "\n";
    });

    // Preenche campo específico
    const idCampo = areaAtual === 'pedagogica' ? 'txtPedagogica' : 
                    areaAtual === 'clinica' ? 'txtClinica' : 'txtSocial';
    document.getElementById(idCampo).value = texto;

    // Adiciona aos globais
    if(texto) document.getElementById('txtConclusao').value += texto + "\n";
    if(indicacoes) document.getElementById('txtIndicacoes').value += indicacoes;
    if(encaminhamentos) document.getElementById('txtEncaminhamentos').value += encaminhamentos;

    fecharModal('modalChecklist');
};

/* --- FIREBASE (SALVAR E BUSCAR) --- */
window.salvarRelatorio = async function() {
    const id = document.getElementById('docId').value;
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
        timestamp: new Date()
    };

    try {
        if (id) {
            await updateDoc(doc(tabelaRelatorios, id), dados);
            alert("Relatório atualizado!");
        } else {
            const docRef = await addDoc(tabelaRelatorios, dados);
            document.getElementById('docId').value = docRef.id;
            alert("Salvo com sucesso!");
        }
    } catch (e) {
        console.error(e);
        alert("Erro ao salvar (Verifique o console/Firebase Config).");
    }
};

window.abrirBusca = function() {
    document.getElementById('modalBusca').style.display = 'flex';
};

window.executarBusca = async function() {
    const termo = document.getElementById('termoBusca').value.toLowerCase();
    const lista = document.getElementById('listaResultados');
    lista.innerHTML = "Carregando...";

    const q = query(tabelaRelatorios, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    
    lista.innerHTML = "";
    snapshot.forEach(docSnap => {
        const d = docSnap.data();
        if (d.estudante.toLowerCase().includes(termo)) {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${d.estudante} (${d.dataAvaliacao})</span>
                <button onclick="carregar('${docSnap.id}')">Carregar</button>
                <button onclick="excluir('${docSnap.id}')" style="background:red">X</button>
            `;
            li.className = "item-resultado"; // Adicione estilo se quiser
            lista.appendChild(li);
        }
    });
};

// Funções globais para botões dinâmicos
window.carregar = async function(id) {
    const docSnap = await getDoc(doc(tabelaRelatorios, id));
    if (docSnap.exists()) {
        const d = docSnap.data();
        document.getElementById('docId').value = id;
        document.getElementById('escola').value = d.escola;
        document.getElementById('nomeEstudante').value = d.estudante;
        document.getElementById('dataNascimento').value = d.nascimento;
        document.getElementById('idade').value = d.idade;
        document.getElementById('filiacao').value = d.filiacao;
        document.getElementById('dataAvaliacao').value = d.dataAvaliacao;
        document.getElementById('txtPedagogica').value = d.txtPedagogica;
        document.getElementById('txtClinica').value = d.txtClinica;
        document.getElementById('txtSocial').value = d.txtSocial;
        document.getElementById('txtConclusao').value = d.txtConclusao;
        document.getElementById('txtIndicacoes').value = d.txtIndicacoes;
        document.getElementById('txtEncaminhamentos').value = d.txtEncaminhamentos;
        document.getElementById('txtObservacoes').value = d.txtObservacoes;
        fecharModal('modalBusca');
    }
};

window.excluir = async function(id) {
    if(confirm("Excluir este relatório?")) {
        await deleteDoc(doc(tabelaRelatorios, id));
        executarBusca(); // Recarrega lista
    }
};