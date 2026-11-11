const etapas = [
  "Solicitação do pedido",
  "Dados do solicitante",
  "Envio do pedido",
  "Forma de pagamento",
  "Pagamento realizado",
  "Pedido recebido pelo delivery",
  "Emissão do pedido",
  "Entrega do pedido",
  "Finalização da venda",
  "Pedido entregue"
];

let produtos = [
  {
    id: 1,
    nome: "Combo Casal",
    preco: 29.90,
    estoque: 20,
    imagem: "imagens/combo-casal.jpeg"
  },
  {
    id: 2,
    nome: "Pizza Família",
    preco: 49.90,
    estoque: 15,
    imagem: "imagens/pizza-familia.jpg"
  },
  {
    id: 3,
    nome: "Batata Frita",
    preco: 14.90,
    estoque: 30,
    imagem: "imagens/batata frita.jpeg"
  },
  {
    id: 4,
    nome: "Refrigerante",
    preco: 8.00,
    estoque: 40,
    imagem: "imagens/refrigerante.png"
  }
];
let carrinho = {};
let pedidos = [];
let pedidoSelecionado = null;
let proximoId = 1001;

const dinheiro = valor =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

function mostrarCliente() {
  document.getElementById("cliente").classList.remove("hidden");
  document.getElementById("painel").classList.add("hidden");
}

function abrirLogin() {
  document.getElementById("loginModal").classList.add("show");
}

function fecharLogin() {
  document.getElementById("loginModal").classList.remove("show");
}

function entrar() {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;

  if (usuario === "admin" && senha === "1234") {
    fecharLogin();
    document.getElementById("cliente").classList.add("hidden");
    document.getElementById("painel").classList.remove("hidden");
    atualizarPainel();
  } else {
    alert("Usuário ou senha incorretos.");
  }
}

function renderProdutos() {
  document.getElementById("produtos").innerHTML =
    produtos.map(p => `
            
<div class="product">

    <div class="photo">
        <img
            src="${p.imagem}"
            alt="${p.nome}"
            style="width:100%; height:100%; object-fit:contain; display:block;"
            onerror="this.parentElement.innerHTML='Imagem indisponível';"
        >
    </div>

    <div class="product-info">

        <h3>${p.nome}</h3>

        <div class="price">
            ${dinheiro(p.preco)}
        </div>

        <small>Disponível: ${p.estoque}</small>

        <button class="btn" onclick="adicionar(${p.id})">
            Adicionar ao pedido
        </button>

    </div>

</div>
        `).join("");
}

function moverCarrossel(direcao) {
  const carrossel = document.getElementById("produtos");

  carrossel.scrollBy({
    left: direcao * 260,
    behavior: "smooth"
  });
}

/* PASSAGEM AUTOMÁTICA DAS IMAGENS */
setInterval(() => {
  const carrossel = document.getElementById("produtos");

  if (carrossel) {
    const limite = carrossel.scrollWidth - carrossel.clientWidth;

    if (carrossel.scrollLeft >= limite - 5) {
      carrossel.scrollTo({
        left: 0,
        behavior: "smooth"
      });
    } else {
      moverCarrossel(1);
    }
  }
}, 3000);

function moverCarrossel(direcao) {
  const carrossel = document.getElementById("produtos");

  carrossel.scrollBy({
    left: direcao * 270,
    behavior: "smooth"
  });
}

function adicionar(id) {
  const produto = produtos.find(p => p.id === id);

  if (!produto || produto.estoque <= 0) {
    alert("Produto indisponível.");
    return;
  }

  if ((carrinho[id] || 0) >= produto.estoque) {
    alert("Quantidade máxima disponível atingida.");
    return;
  }

  carrinho[id] = (carrinho[id] || 0) + 1;
  atualizarTotal();
}

function atualizarTotal() {
  let total = 0;

  Object.keys(carrinho).forEach(id => {
    const produto = produtos.find(p => p.id == id);
    if (produto) total += produto.preco * carrinho[id];
  });

  document.getElementById("totalCliente").textContent = dinheiro(total);
}

function enviarPedido() {
  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const endereco = document.getElementById("endereco").value.trim();

  if (!nome || !telefone || !endereco) {
    alert("Preencha nome, WhatsApp e endereço.");
    return;
  }

  const itens = Object.keys(carrinho).map(id => {
    const produto = produtos.find(p => p.id == id);

    return {
      produto: produto.nome,
      quantidade: carrinho[id],
      preco: produto.preco,
      produtoId: produto.id
    };
  });

  if (!itens.length) {
    alert("Adicione pelo menos um produto.");
    return;
  }

  const total = itens.reduce(
    (soma, item) => soma + item.preco * item.quantidade, 0
  );

  const pedido = {
    id: proximoId++,
    nome,
    telefone,
    documento: document.getElementById("documento").value,
    email: document.getElementById("email").value,
    cep: document.getElementById("cep").value,
    endereco,
    complemento: document.getElementById("complemento").value,
    pagamento: document.getElementById("pagamento").value,
    observacao: document.getElementById("observacao").value,
    itens,
    total,
    etapa: 0,
    status: etapas[0],
    data: new Date().toLocaleString("pt-BR")
  };

  pedidos.push(pedido);

  itens.forEach(item => {
    const produto = produtos.find(p => p.id === item.produtoId);
    produto.estoque -= item.quantidade;
  });

  carrinho = {};
  atualizarTotal();

  alert("Pedido nº " + pedido.id + " enviado com sucesso!");

  document.getElementById("consultaId").value = pedido.id;
  atualizarPainel();
}

function consultarPedido() {
  const id = Number(document.getElementById("consultaId").value);
  const pedido = pedidos.find(p => p.id === id);
  const area = document.getElementById("resultadoConsulta");

  if (!pedido) {
    area.innerHTML = "<p>Pedido não encontrado.</p>";
    return;
  }

  area.innerHTML = `
    <h3>Pedido nº ${pedido.id}</h3>
    <p>Status: <b>${pedido.status}</b></p>
    <p>Total: ${dinheiro(pedido.total)}</p>
    <div class="steps">
      ${etapas.map((etapa, i) => `
        <div class="step ${i < pedido.etapa ? "done" :
      i === pedido.etapa ? "current" : ""
    }">
          <b>${i + 1}. ${etapa}</b>
          ${i < pedido.etapa ? "Concluído" :
      i === pedido.etapa ? "Em andamento" : "Pendente"}
        </div>
      `).join("")}
    </div>
  `;
}

function atualizarPainel() {
  document.getElementById("qtdPedidos").textContent = pedidos.length;

  document.getElementById("qtdAndamento").textContent =
    pedidos.filter(p => p.etapa < 9 && p.status !== "Cancelado").length;

  document.getElementById("qtdEntregues").textContent =
    pedidos.filter(p => p.etapa === 9).length;

  document.getElementById("valorVendido").textContent =
    dinheiro(pedidos.filter(p => p.etapa === 9)
      .reduce((soma, p) => soma + p.total, 0));

  document.getElementById("fluxo").innerHTML =
    etapas.map((etapa, i) => `
      <div class="step">
        <b>${i + 1}. ${etapa}</b>
        ${pedidos.filter(p => p.etapa === i).length} pedido(s)
      </div>
    `).join("");

  document.getElementById("listaPedidos").innerHTML =
    pedidos.map(p => `
      <tr>
        <td>#${p.id}</td>
        <td>${p.nome}</td>
        <td>${p.data}</td>
        <td>${dinheiro(p.total)}</td>
        <td><span class="status">${p.status}</span></td>
        <td>
          <button class="btn" onclick="selecionarPedido(${p.id})">
            Gerenciar
          </button>
        </td>
      </tr>
    `).join("") ||
    "<tr><td colspan='6'>Nenhum pedido recebido.</td></tr>";

  document.getElementById("listaClientes").innerHTML =
    pedidos.map(p => `
      <p><b>${p.nome}</b> — ${p.telefone} — ${p.endereco}</p>
    `).join("") || "Nenhum cliente cadastrado.";

  document.getElementById("listaEntregas").innerHTML =
    pedidos.map(p => `
      <p>Pedido #${p.id} — ${p.nome} — ${p.status}</p>
    `).join("") || "Nenhuma entrega cadastrada.";

  document.getElementById("tabelaProdutos").innerHTML =
    produtos.map(p => `
      <p>${p.nome} — ${dinheiro(p.preco)}</p>
    `).join("");

  document.getElementById("listaEstoque").innerHTML =
    produtos.map(p => `
      <p>${p.nome} — Estoque: <b>${p.estoque}</b></p>
    `).join("");
}

function selecionarPedido(id) {
  pedidoSelecionado = pedidos.find(p => p.id === id);
  const p = pedidoSelecionado;

  document.getElementById("detalhesPedido").innerHTML = `
    <h3>Pedido #${p.id} — ${p.nome}</h3>
    <p>WhatsApp: ${p.telefone} | Endereço: ${p.endereco}</p>
    <p>Pagamento: ${p.pagamento} | Total: <b>${dinheiro(p.total)}</b></p>
    <h3>Itens</h3>
    ${p.itens.map(i => `
      <p>${i.quantidade}x ${i.produto} — ${dinheiro(i.preco * i.quantidade)}</p>
    `).join("")}
    <h3>Etapas do pedido</h3>
    <div class="steps">
      ${etapas.map((e, i) => `
        <div class="step ${i < p.etapa ? "done" :
      i === p.etapa ? "current" : ""
    }">
          <b>${i + 1}. ${e}</b>
          ${i < p.etapa ? "Concluído" :
      i === p.etapa ? "Atual" : "Pendente"}
        </div>
      `).join("")}
    </div>
    <p><label>Atualizar etapa</label>
    <select id="novaEtapa">
      ${etapas.map((e, i) => `
        <option value="${i}" ${i === p.etapa ? "selected" : ""}>
          ${i + 1} - ${e}
        </option>
      `).join("")}
      <option value="cancelado">Cancelar pedido</option>
    </select></p>
    <button class="btn" onclick="atualizarEtapa()">Salvar atualização</button>
  `;
}

function atualizarEtapa() {
  const valor = document.getElementById("novaEtapa").value;

  if (valor === "cancelado") {
    if (!confirm("Deseja cancelar este pedido?")) return;
    pedidoSelecionado.status = "Cancelado";
  } else {
    pedidoSelecionado.etapa = Number(valor);
    pedidoSelecionado.status = etapas[pedidoSelecionado.etapa];
  }

  atualizarPainel();
  selecionarPedido(pedidoSelecionado.id);
}

function cadastrarProduto() {
  const nome = document.getElementById("novoProduto").value.trim();
  const preco = Number(document.getElementById("novoPreco").value);
  const estoque = Number(document.getElementById("novoEstoque").value);

  if (!nome || preco <= 0 || estoque < 0) {
    alert("Informe os dados corretamente.");
    return;
  }

  produtos.push({
    id: Date.now(),
    nome,
    preco,
    estoque,
    icone: "📦"
  });

  renderProdutos();
  atualizarPainel();

  document.getElementById("novoProduto").value = "";
  document.getElementById("novoPreco").value = "";
  document.getElementById("novoEstoque").value = "";

  alert("Produto cadastrado.");
}

function aba(id, botao) {
  document.querySelectorAll(".aba").forEach(x =>
    x.classList.add("hidden")
  );

  document.getElementById(id).classList.remove("hidden");

  document.querySelectorAll("nav button").forEach(x =>
    x.classList.remove("active")
  );

  botao.classList.add("active");
}

renderProdutos();
atualizarTotal();
function mostrarPagamento() {
  const pagamento = document.getElementById("pagamento").value;

  const cartao = document.getElementById("pagamentoCartao");
  const pix = document.getElementById("pagamentoPix");
  const dinheiro = document.getElementById("pagamentoDinheiro");
  const parcelas = document.getElementById("opcaoParcelas");

  // Esconde todas as áreas
  cartao.classList.add("oculto");
  pix.classList.add("oculto");
  dinheiro.classList.add("oculto");
  parcelas.classList.add("oculto");

  // Cartão de crédito
  if (pagamento === "credito") {
    cartao.classList.remove("oculto");
    parcelas.classList.remove("oculto");
  }

  // Cartão de débito
  else if (pagamento === "debito") {
    cartao.classList.remove("oculto");
  }

  // Pix
  else if (pagamento === "pix") {
    pix.classList.remove("oculto");
  }

  // Dinheiro
  else if (pagamento === "dinheiro") {
    dinheiro.classList.remove("oculto");
  }
  function copiarPix() {
    const chave = document.getElementById("chavePix").value;

    navigator.clipboard.writeText(chave)
        .then(() => {
            alert("Chave Pix copiada! Agora faça o pagamento no aplicativo do seu banco.");
        })
        .catch(() => {
            alert("Não foi possível copiar. Selecione e copie a chave manualmente.");
        });
}
}