const express = require("express");
const app = express();
const port = 3000;
const { v4: uuidv4 } = require("uuid");
const novaConta = Math.floor(Math.random() * 10000000);
const contasClientes = require("./model/contas-clientes.json");

app.use(express.json());

// - Criar os clientes do banco
app.post("/conta/add", (req, res) => {
  const {
    nome_cliente,
    cpf_cliente,
    data_nascimento,
    conta: { tipo },
  } = req.body;
  const existeCPF = contasClientes.find(
    (conta) => conta.cpf_cliente == cpf_cliente
  );

  if (!existeCPF) {
    const novoCliente = {
      id: uuidv4(),
      nome_cliente,
      cpf_cliente,
      data_nascimento,
      conta: {
        numero: novaConta,
        tipo,
        saldo: 0,
        data_criacao: new Date(),
      },
    };
    contasClientes.push(novoCliente);
    return res.status(201).json(contasClientes);
  }
  return res.status(404).json({
    messagem: `Cliente com CPF: ${cpf_cliente} já possui conta cadastrada neste Banco`,
  });
});

// - Atualizar informações desses clientes ( como endereço, telefone de contato...)
app.patch("/conta/:id/consulta/:telefone", (req, res) => {
  const idCliente = req.params.id;
  const idTelefone = req.params.telefone;
  const { telefone: newNumber } = req.body;

  const existeCliente = contasClientes.find((conta) => conta.id == idCliente);

  if (existeCliente) {
    const atualizarCliente = contasClientes.map((conta) => {
      if (conta.id == idCliente && conta.telefone != idTelefone) {
        conta.telefone = newNumber;
      }
      return { ...conta };
    });
    contasClientes.map((cliente, index) => {
      if (cliente.id == idCliente) {
        contasClientes[index].conta = atualizarCliente;
      }
    });
    return res.status(200).json(atualizarCliente);
  }

  return res.status(404).json({ messagem: "Cliente não foi encontrado" });
});
// - Fazer depósitos / pagamentos usando o saldo de sua conta
app.patch("/conta/:id/deposito", (req, res) => {
  const idCliente = req.params.id;
  const { deposito } = req.body;

  const clienteExiste = contasClientes.find(
    (cliente) => cliente.id == idCliente
  );

  if (clienteExiste) {
    const efetuarDeposito = {
      ...clienteExiste.conta,
      saldo: clienteExiste.conta.saldo + deposito,
    };

    contasClientes.map((cliente, index) => {
      if (cliente.id == idCliente) {
        contasClientes[index].conta = efetuarDeposito;
      }
    });
    return res.status(200).json(contasClientes);
  }
  return res.status(404).json({ messagem: "Cliente não foi encontrado" });
});

app.patch("/conta/:id/pagamento", (req, res) => {
  const idCliente = req.params.id;
  const { pagamento } = req.body;

  const clienteExiste = contasClientes.find(
    (cliente) => cliente.id == idCliente
  );

  if (clienteExiste) {
    const efetuarPagamento = {
      ...clienteExiste.conta,
      saldo: clienteExiste.conta.saldo - pagamento,
    };

    contasClientes.map((cliente, index) => {
      if (cliente.id == idCliente) {
        contasClientes[index].conta = efetuarPagamento;
      }
    });
    return res.status(200).json(contasClientes);
  }
  return res.status(404).json({ messagem: "Cliente não foi encontrado" });
});

// - Encerrar contas de clientes
app.delete("/conta/deletar/:id", (req, res) => {
  const idUser = req.params.id;

  const existeCliente = contasClientes.find((conta) => conta.id == idUser);

  if (existeCliente) {
    contasClientes.map((user, index) => {
      if (user.id == idUser) {
        return contasClientes.splice(index, 1);
      }
    });
    return res.status(200).json(contasClientes);
  }
  return res.status(404).json({
    message: "O usuário não foi encontrado. Digite o ID correto",
  });
});
// - Conseguir Filtrar os clientes do banco pelo seu nome, por saldo...
app.get("/conta/filtros", (req, res) => {
  const filtrarNome = req.query.nome;
  const filtrarNascimento = req.query.data;
  const filtrarSaldo = parseFloat(req.query.saldo);

  const prodFiltros = contasClientes.filter((item) => {
    if (filtrarNome) {
      return item.nome_cliente.toLowerCase() == filtrarNome.toLowerCase();
    }
    if (filtrarNascimento) {
      return item.data_nascimento == filtrarNascimento;
    }
    if (filtrarSaldo) {
      return item.conta.saldo == filtrarSaldo;
    }
    return item;
  });
  return res.status(200).json(prodFiltros);
});

app.listen(port, () => {
  console.log(`API está rodando na porta ${port}`);
});