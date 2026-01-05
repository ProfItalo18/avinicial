import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =========================================================
   1) FIREBASE
   ========================================================= */
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
const relatoriosRef = collection(db, "relatorios");

let idRelatorioAtual = null;

/* =========================================================
   2) MAPEAMENTO DA EQUIPE (ASSINATURAS)
   ========================================================= */
const EQUIPE = {
  pedagogia: {
    ped1: {
      nome: "Jheniffer Cavalheiro André",
      cargo: "Pedagoga",
      registro: "RG 9.727.432-0 / Ata nº 15/2018",
      img: "asspedagoda.png"
    },
    ped2: {
      nome: "Isabella Floripes Sanches",
      cargo: "Pedagoga",
      registro: "RG 10.617.697-3 / Ata nº 17/2021",
      img: "asspedagoda2.png"
    }
  },
  clinica: {
    psi1: {
      nome: "Jaqueline Gonçalves Malaquim",
      cargo: "Psicóloga",
      registro: "CRP 08/30518",
      img: "asspsicologa.png"
    }
  },
  social: {
    soc1: {
      nome: "Andrea Cristina Santos",
      cargo: "Assistente Social",
      registro: "CRESS/PR 9794",
      img: "asssocial.png"
    }
  }
};

/* =========================================================
   3) CHECKLIST (COM 3 ESTADOS)
   - "nao" = não observado
   - "completo", "parcial", "recusou"
   ========================================================= */
const CHECKLIST = {
  pedagogica: [
    "Demonstra interesse nas atividades propostas",
    "Segue rotinas com previsibilidade e boa adaptação",
    "Compreende comandos simples e instruções diretas",
    "Mantém atenção sustentada durante tarefas",
    "Apresenta organização de materiais e autonomia",
    "Reconhece letras/números conforme a etapa escolar",
    "Realiza registro gráfico/escrita com apoio necessário",
    "Interage com colegas e adultos com adequação"
  ],
  clinica: [
    "Mantém contato visual funcional durante interação",
    "Atende pelo nome e responde a chamadas",
    "Comunica necessidades básicas (verbal ou alternativa)",
    "Apresenta estereotipias/rituais que interferem na rotina",
    "Demonstra hipersensibilidade/hipossensibilidade sensorial",
    "Tolera frustrações e mudanças graduais de rotina",
    "Realiza autorregulação com apoio (estratégias)",
    "Apresenta coordenação motora fina/grossa compatível"
  ],
  social: [
    "Família participa ativamente do processo escolar",
    "Há acesso a serviços da rede (CRAS/CREAS/UBS etc.)",
    "Situação econômica interfere na permanência/rotina",
    "Há rede de apoio (familiares, comunidade, serviços)",
    "Comparece às reuniões e responde aos encaminhamentos",
    "Apresenta necessidade de benefícios/auxílios (quando aplicável)",
    "Há rotina estruturada em casa para estudos e cuidados",
    "Transporte/locomoção é adequado e regular"
  ]
};

const STATUS_LABEL = {
  nao: "Não observado",
  completo: "Completo",
  parcial: "Parcial",
  recusou: "Recusou"
};

/* =========================================================
   4) ESTADO POR ÁREA (salvo e carregado)
   ========================================================= */
const estado = {
  pedagogica: { obsManual: "", status: {} },
  clinica: { obsManual: "", status: {} },
  social: { obsManual: "", status: {} }
};

let areaAtual = null;

/* =========================================================
   5) HELPERS (DOM)
   ========================================================= */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

function autoResize(el) {
  if (!el || el.tagName !== "TEXTAREA") return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

function autoResizeAll() {
  $$("textarea").forEach(autoResize);
}

/* =========================================================
   6) IDADE
   ========================================================= */
function calcularIdade() {
  const dn = $("#dataNascimento").value;
  if (!dn) return;

  const nasc = new Date(dn);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;

  $("#idade").value = String(Math.max(0, idade));
}

/* =========================================================
   7) ASSINATURAS
   ========================================================= */
function aplicarAssinatura(area, key) {
  const map = EQUIPE[area];
  const prof = map?.[key];

  const ids = {
    pedagogia: {
      img: "#sigImgPedagogia", nome: "#sigNomePedagogia",
      cargo: "#sigCargoPedagogia", reg: "#sigRegPedagogia"
    },
    clinica: {
      img: "#sigImgClinica", nome: "#sigNomeClinica",
      cargo: "#sigCargoClinica", reg: "#sigRegClinica"
    },
    social: {
      img: "#sigImgSocial", nome: "#sigNomeSocial",
      cargo: "#sigCargoSocial", reg: "#sigRegSocial"
    }
  };

  const ref = ids[area];
  if (!ref) return;

  if (!prof) {
    $(ref.img).src = "";
    $(ref.nome).textContent = "—";
    $(ref.cargo).textContent = "—";
    $(ref.reg).textContent = "—";
    return;
  }

  $(ref.img).src = prof.img;
  $(ref.nome).textContent = prof.nome;
  $(ref.cargo).textContent = prof.cargo;
  $(ref.reg).textContent = prof.registro;
}

/* =========================================================
   8) MODAL ÁREA (CHECKLIST + GERAÇÃO)
   ========================================================= */
function abrirModalArea(area) {
  areaAtual = area;
  $("#modalTitulo").textContent =
    area === "pedagogica" ? "Avaliação Pedagógica" :
    area === "clinica" ? "Avaliação Clínica" :
    "Serviço Social";

  // Preenche manual
  $("#modalObsManual").value = estado[area].obsManual || "";

  // Render checklist
  const container = $("#modalChecklist");
  container.innerHTML = "";

  const itens = CHECKLIST[area];
  itens.forEach((txt, idx) => {
    const key = `i${idx}`;
    const current = estado[area].status[key] || "nao";

    const row = document.createElement("div");
    row.className = "check-row";
    row.innerHTML = `
      <div class="check-text">${txt}</div>
      <div class="check-select">
        <select data-item="${key}">
          <option value="nao">Não observado</option>
          <option value="completo">Completo</option>
          <option value="parcial">Parcial</option>
          <option value="recusou">Recusou</option>
        </select>
      </div>
    `;
    container.appendChild(row);

    row.querySelector("select").value = current;
  });

  // Texto automático e prévia
  atualizarTextoAutomatico();
  atualizarPreviewFinal();

  // Abrir modal
  $("#modalArea").classList.add("open");
  $("#modalArea").setAttribute("aria-hidden", "false");

  // Auto-resize
  autoResize($("#modalObsManual"));
  autoResize($("#modalTextoAuto"));
}

function fecharModalArea() {
  $("#modalArea").classList.remove("open");
  $("#modalArea").setAttribute("aria-hidden", "true");
  areaAtual = null;
}

function lerChecklistModal() {
  const status = {};
  $$("#modalChecklist select").forEach(sel => {
    const k = sel.getAttribute("data-item");
    status[k] = sel.value;
  });
  return status;
}

function atualizarTextoAutomatico() {
  if (!areaAtual) return;

  const status = lerChecklistModal();
  const itens = CHECKLIST[areaAtual];

  const completos = [];
  const parciais = [];
  const recusou = [];

  itens.forEach((txt, idx) => {
    const key = `i${idx}`;
    const st = status[key] || "nao";
    if (st === "completo") completos.push(txt);
    if (st === "parcial") parciais.push(txt);
    if (st === "recusou") recusou.push(txt);
  });

  const partes = [];

  if (completos.length) {
    partes.push(`Evidenciou desempenho satisfatório/consistente em: ${lista(completos)}.`);
  }
  if (parciais.length) {
    partes.push(`Apresentou realização parcial/necessidade de mediação em: ${lista(parciais)}.`);
  }
  if (recusou.length) {
    partes.push(`Houve recusa ou resistência significativa em: ${lista(recusou)}.`);
  }

  const base =
    partes.length
      ? `Durante a observação nesta área, registrou-se que o(a) estudante ${partes.join(" ")}`
      : `Durante a observação nesta área, não foram registrados itens suficientes para compor uma síntese automática.`;

  $("#modalTextoAuto").value = base;
  autoResize($("#modalTextoAuto"));
}

function atualizarPreviewFinal() {
  const manual = $("#modalObsManual").value.trim();
  const autoTxt = $("#modalTextoAuto").value.trim();

  const final = [autoTxt, manual].filter(Boolean).join("\n\n");
  $("#modalPreviewFinal").textContent = final || "—";
}

function lista(arr) {
  if (arr.length === 1) return arr[0].toLowerCase();
  const last = arr[arr.length - 1].toLowerCase();
  const head = arr.slice(0, -1).map(s => s.toLowerCase());
  return `${head.join(", ")} e ${last}`;
}

function limparAreaAtual() {
  if (!areaAtual) return;
  if (!confirm("Deseja limpar os dados desta área?")) return;

  estado[areaAtual] = { obsManual: "", status: {} };
  $("#modalObsManual").value = "";

  // Reset selects
  $$("#modalChecklist select").forEach(sel => (sel.value = "nao"));

  atualizarTextoAutomatico();
  atualizarPreviewFinal();
  toast("Área limpa.");
}

/* Confirmar e gerar */
function confirmarArea() {
  if (!areaAtual) return;

  // salva no estado
  estado[areaAtual].obsManual = $("#modalObsManual").value;
  estado[areaAtual].status = lerChecklistModal();

  // Gera síntese no documento
  const sinteseId =
    areaAtual === "pedagogica" ? "#sintesePedagogica" :
    areaAtual === "clinica" ? "#sinteseClinica" :
    "#sinteseSocial";

  const textoFinal = [$("#modalTextoAuto").value.trim(), $("#modalObsManual").value.trim()]
    .filter(Boolean)
    .join("\n\n");

  $(sinteseId).value = textoFinal;
  autoResize($(sinteseId));

  // Gera indicações (com base em parciais/recusas)
  gerarIndicacoesPedagogicas();

  // Recalcula conclusão
  gerarConclusao();

  toast("Texto gerado com sucesso!");
  fecharModalArea();
}

/* =========================================================
   9) GERAÇÃO AUTOMÁTICA: INDICAÇÕES + CONCLUSÃO
   ========================================================= */
function gerarIndicacoesPedagogicas() {
  // Aqui usamos principalmente o que foi "parcial" ou "recusou" nas áreas
  const coletarPontos = (area) => {
    const itens = CHECKLIST[area];
    const st = estado[area].status || {};
    const pontos = [];

    itens.forEach((txt, idx) => {
      const k = `i${idx}`;
      if (st[k] === "parcial") pontos.push({ tipo: "parcial", txt });
      if (st[k] === "recusou") pontos.push({ tipo: "recusou", txt });
    });
    return pontos;
  };

  const pontos = [
    ...coletarPontos("pedagogica"),
    ...coletarPontos("clinica"),
    ...coletarPontos("social")
  ];

  if (!pontos.length) return;

  const linhas = [];
  const parciais = pontos.filter(p => p.tipo === "parcial").map(p => p.txt);
  const recusas = pontos.filter(p => p.tipo === "recusou").map(p => p.txt);

  if (parciais.length) {
    linhas.push(
      `- Intensificar mediações graduais e previsíveis para favorecer: ${lista(parciais)}.`
    );
  }
  if (recusas.length) {
    linhas.push(
      `- Planejar estratégias de engajamento (rotina visual, escolha guiada, reforço positivo) para: ${lista(recusas)}.`
    );
  }

  linhas.push(`- Manter registro contínuo de evolução, com metas de curto prazo e reavaliações periódicas.`);

  const atual = $("#indicacoesPedagogicas").value.trim();
  const novo = linhas.join("\n");

  $("#indicacoesPedagogicas").value = atual ? `${atual}\n\n${novo}` : novo;
  autoResize($("#indicacoesPedagogicas"));
}

function gerarConclusao() {
  const ped = $("#sintesePedagogica").value.trim();
  const cli = $("#sinteseClinica").value.trim();
  const soc = $("#sinteseSocial").value.trim();

  const partes = [];
  if (ped) partes.push("No campo pedagógico, " + resumir(ped));
  if (cli) partes.push("No campo clínico/funcional, " + resumir(cli));
  if (soc) partes.push("No campo social/familiar, " + resumir(soc));

  const conclusao =
    partes.length
      ? partes.join("\n\n") + "\n\nRecomenda-se acompanhamento multiprofissional contínuo, alinhamento com a família e adequações pedagógicas individualizadas conforme necessidade observada."
      : "A conclusão diagnóstica será gerada automaticamente após o preenchimento das sínteses das áreas avaliadas.";

  $("#conclusaoDiagnostica").value = conclusao;
  autoResize($("#conclusaoDiagnostica"));
}

function resumir(texto) {
  // heurística simples: pega a primeira frase “forte”
  const limpo = texto.replace(/\s+/g, " ").trim();
  const cortes = limpo.split(/(?<=[.!?])\s+/);
  return (cortes[0] || limpo).trim();
}

/* =========================================================
   10) IMPRESSÃO SEM CORTES (substitutos)
   ========================================================= */
window.onbeforeprint = () => {
  const fields = document.querySelectorAll("textarea, input, select");
  fields.forEach(el => {
    const div = document.createElement("div");
    div.className = "print-substitute";
    div.setAttribute("data-print-temp", "true");

    let txt = "";
    if (el.tagName === "SELECT") {
      const opt = el.options[el.selectedIndex];
      txt = opt ? opt.text : "";
      if (/Selecione/i.test(txt)) txt = "";
    } else {
      txt = el.value || el.getAttribute("value") || "";
    }

    div.textContent = txt ? txt : " ";
    el.parentNode.insertBefore(div, el);
  });
};

window.onafterprint = () => {
  document.querySelectorAll('[data-print-temp="true"]').forEach(n => n.remove());
};

function imprimir() {
  autoResizeAll();
  setTimeout(() => window.print(), 200);
}

/* =========================================================
   11) CRUD FIREBASE (salvar/atualizar/listar/abrir/excluir)
   ========================================================= */
function coletarFormulario() {
  const data = {};
  document.querySelectorAll("input, textarea, select").forEach(el => {
    if (!el.id) return;
    data[el.id] = el.value;
  });

  // estado das áreas e assinaturas
  data.__estadoAreas = JSON.stringify(estado);
  return data;
}

function aplicarFormulario(form) {
  for (const key in form) {
    const el = document.getElementById(key);
    if (!el) continue;

    el.value = form[key];

    // assinatura: atualizar na tela
    if (key === "sigSelectPedagogia") aplicarAssinatura("pedagogia", el.value);
    if (key === "sigSelectClinica") aplicarAssinatura("clinica", el.value);
    if (key === "sigSelectSocial") aplicarAssinatura("social", el.value);
  }

  // Restaurar estado
  if (form.__estadoAreas) {
    try {
      const parsed = JSON.parse(form.__estadoAreas);
      ["pedagogica", "clinica", "social"].forEach(a => {
        if (parsed?.[a]) estado[a] = parsed[a];
      });
    } catch {}
  }

  autoResizeAll();
  gerarConclusao();
}

async function salvar() {
  const nomeAluno = $("#nomeAluno").value.trim();
  if (!nomeAluno) {
    toast("Preencha o nome do estudante.");
    $("#nomeAluno").focus();
    return;
  }

  const payload = {
    nomeAluno,
    dataCriacao: new Date().toISOString(),
    formulario: coletarFormulario()
  };

  try {
    if (idRelatorioAtual) {
      await updateDoc(doc(db, "relatorios", idRelatorioAtual), payload);
      toast("Relatório atualizado com sucesso!");
    } else {
      const ref = await addDoc(relatoriosRef, payload);
      idRelatorioAtual = ref.id;
      toast("Novo relatório salvo com sucesso!");
    }
  } catch (e) {
    console.error(e);
    toast("Erro ao salvar. Verifique o console.");
  }
}

async function listarRelatorios() {
  const box = $("#listaRelatorios");
  box.innerHTML = `<div class="hint">Carregando...</div>`;

  try {
    const q = query(relatoriosRef, orderBy("dataCriacao", "desc"));
    const snap = await getDocs(q);

    if (snap.empty) {
      box.innerHTML = `<div class="hint">Nenhum relatório encontrado.</div>`;
      return;
    }

    box.innerHTML = "";
    snap.forEach(docSnap => {
      const d = docSnap.data();
      const el = document.createElement("div");
      el.className = "item result-item";
      el.setAttribute("data-name", (d.nomeAluno || "").toLowerCase());

      const dataFmt = d.dataCriacao ? new Date(d.dataCriacao).toLocaleDateString() : "";

      el.innerHTML = `
        <div>
          <strong>${escapeHtml(d.nomeAluno || "Sem nome")}</strong>
          <small>${escapeHtml(dataFmt)}</small>
        </div>
        <div class="actions">
          <button class="action open" data-open="${docSnap.id}">
            <i class="fa-solid fa-folder-open"></i> Abrir
          </button>
          <button class="action del" data-del="${docSnap.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;
      box.appendChild(el);
    });

  } catch (e) {
    console.error(e);
    box.innerHTML = `<div class="hint">Erro ao listar relatórios.</div>`;
  }
}

async function abrirRelatorio(id) {
  try {
    const ref = doc(db, "relatorios", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      toast("Relatório não encontrado.");
      return;
    }

    idRelatorioAtual = id;
    const data = snap.data();
    aplicarFormulario(data.formulario || {});
    toast("Relatório carregado!");
    fecharBusca();
  } catch (e) {
    console.error(e);
    toast("Erro ao abrir relatório.");
  }
}

async function excluirRelatorio(id) {
  if (!confirm("Deseja excluir este relatório permanentemente?")) return;
  try {
    await deleteDoc(doc(db, "relatorios", id));
    toast("Relatório excluído.");
    await listarRelatorios();
  } catch (e) {
    console.error(e);
    toast("Erro ao excluir.");
  }
}

/* =========================================================
   12) BUSCA UI
   ========================================================= */
function abrirBusca() {
  $("#modalBusca").classList.add("open");
  $("#modalBusca").setAttribute("aria-hidden", "false");
  listarRelatorios();
  $("#inputBusca").value = "";
  $("#inputBusca").focus();
}

function fecharBusca() {
  $("#modalBusca").classList.remove("open");
  $("#modalBusca").setAttribute("aria-hidden", "true");
}

function filtrarLista() {
  const termo = $("#inputBusca").value.toLowerCase().trim();
  $$(".result-item").forEach(item => {
    const name = item.getAttribute("data-name") || "";
    item.style.display = name.includes(termo) ? "flex" : "none";
  });
}

/* =========================================================
   13) LIMPAR
   ========================================================= */
function novoRelatorio() {
  if (!confirm("Deseja iniciar um NOVO relatório? Dados não salvos serão perdidos.")) return;

  idRelatorioAtual = null;

  // limpa campos
  $$("input, textarea").forEach(el => {
    if (el.id === "municipio" || el.id === "nre") return;
    if (el.hasAttribute("readonly")) {
      if (el.id === "idade") el.value = "";
      return;
    }
    el.value = "";
  });
  $$("select").forEach(el => (el.value = ""));

  // reseta estado
  ["pedagogica","clinica","social"].forEach(a => {
    estado[a] = { obsManual:"", status:{} };
  });

  // limpa assinaturas
  aplicarAssinatura("pedagogia", "");
  aplicarAssinatura("clinica", "");
  aplicarAssinatura("social", "");

  autoResizeAll();
  gerarConclusao();
  toast("Novo relatório pronto.");
}

/* =========================================================
   14) SEGURANÇA DE STRING
   ========================================================= */
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================================
   15) EVENTOS
   ========================================================= */
function bind() {
  // auto-resize para todas textareas
  $$("textarea").forEach(t => {
    autoResize(t);
    t.addEventListener("input", () => autoResize(t));
  });

  // idade
  $("#dataNascimento").addEventListener("change", () => {
    calcularIdade();
    gerarConclusao();
  });

  // botões área
  $$("[data-open-area]").forEach(btn => {
    btn.addEventListener("click", () => abrirModalArea(btn.getAttribute("data-open-area")));
  });

  // modal área
  $("#btnCloseModal").addEventListener("click", fecharModalArea);
  $("#btnResetArea").addEventListener("click", limparAreaAtual);
  $("#btnConfirmArea").addEventListener("click", confirmarArea);

  $("#modalObsManual").addEventListener("input", () => {
    autoResize($("#modalObsManual"));
    atualizarPreviewFinal();
  });

  $("#modalChecklist").addEventListener("change", (e) => {
    if (e.target && e.target.tagName === "SELECT") {
      atualizarTextoAutomatico();
      atualizarPreviewFinal();
    }
  });

  // assinaturas
  $("#sigSelectPedagogia").addEventListener("change", (e) => aplicarAssinatura("pedagogia", e.target.value));
  $("#sigSelectClinica").addEventListener("change", (e) => aplicarAssinatura("clinica", e.target.value));
  $("#sigSelectSocial").addEventListener("change", (e) => aplicarAssinatura("social", e.target.value));

  // fab
  $("#btnPrint").addEventListener("click", imprimir);
  $("#btnSave").addEventListener("click", salvar);
  $("#btnSearch").addEventListener("click", abrirBusca);
  $("#btnNew").addEventListener("click", novoRelatorio);

  // busca
  $("#btnCloseBusca").addEventListener("click", fecharBusca);
  $("#btnCloseBusca2").addEventListener("click", fecharBusca);
  $("#btnRefreshList").addEventListener("click", listarRelatorios);
  $("#inputBusca").addEventListener("input", filtrarLista);

  $("#listaRelatorios").addEventListener("click", (e) => {
    const openId = e.target.closest("[data-open]")?.getAttribute("data-open");
    const delId = e.target.closest("[data-del]")?.getAttribute("data-del");
    if (openId) abrirRelatorio(openId);
    if (delId) excluirRelatorio(delId);
  });

  // recalcula conclusão quando sínteses forem editadas manualmente
  ["#sintesePedagogica","#sinteseClinica","#sinteseSocial"].forEach(id => {
    $(id).addEventListener("input", () => {
      autoResize($(id));
      gerarConclusao();
    });
  });
}

/* =========================================================
   INIT
   ========================================================= */
window.addEventListener("load", () => {
  bind();
  gerarConclusao();
  toast("Sistema iniciado.");
});

function atualizarLocalDataAssinatura(){
  const campoData = document.getElementById("dataAvaliacao");
  const box = document.getElementById("sigLocalData");
  if(!campoData || !box) return;

  if(!campoData.value){
    box.textContent = "Londrina/PR";
    return;
  }

  const data = new Date(campoData.value + "T00:00:00");
  const formato = data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  box.textContent = `Londrina/PR, ${formato}`;
}

document.getElementById("dataAvaliacao")?.addEventListener("change", atualizarLocalDataAssinatura);
window.addEventListener("load", atualizarLocalDataAssinatura);
