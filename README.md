# 🌍 Geo-Explorer

> Plataforma de gerenciamento de trilhas de aprendizagem em tecnologia, desafios de código e emissão de certificados via Model Context Protocol (MCP).

Projeto desenvolvido como entregável prático do **Bootcamp IBM** na plataforma **DIO.me**, utilizando o assistente **IBM Bob** para suporte no desenvolvimento, validação de tipos e testes automatizados.

---

## 📌 Sobre o Projeto

O **Geo-Explorer** é uma ferramenta CLI (Interface de Linha de Comando) e um Servidor MCP construído em **TypeScript** e **Node.js**. O objetivo do sistema é estruturar planos de estudo em tecnologia, gerar desafios práticos customizados por nível de senioridade e emitir certificados em arte ASCII com hash único de verificação de autenticidade.

---

## 🚀 Funcionalidades Principais

* **📂 Consulta de Trilhas (`getTrack`):** Exibe planos de estudos estruturados por módulos de conhecimento (Node.js, Python, Automação/RPA e mais).
* **💻 Desafios Práticos (`getChallenge`):** Gera problemas de código adaptados ao nível do estudante (Iniciante e Intermediário).
* **📜 Certificação com Hash (`generateCertificate` / `verifyCertificate`):** Gera certificados estilizados em arte ASCII com código único de autenticação e permite a consulta de sua validade.
* **🤖 Servidor MCP (`src/mcp/server.ts`):** Expõe todas as funções como *Tools* do Model Context Protocol para integração direta com agentes de Inteligência Artificial.

---

## 🛠️ Tecnologias Utilizadas

* **Linguagem:** TypeScript
* **Ambiente de Execução:** Node.js
* **Protocolo de IA:** Model Context Protocol (MCP) SDK
* **Testes Unitários:** Jest
* **Assistente de IA:** IBM Bob
* **Bibliotecas auxiliares:** Inquirer, Chalk (para CLI interativa)

---

## 📁 Estrutura de Pastas

geo-explorer/
├── docs/             # Documentação e arquivos auxiliares
├── src/              # Código-fonte da aplicação
│   ├── commands/     # Lógica dos comandos e regras de negócio
│   ├── data/         # Arquivos de dados JSON (trilhas e desafios)
│   ├── mcp/          # Servidor e ferramentas do protocolo MCP
│   ├── cli.ts        # Ponto de entrada da CLI interativa
│   └── types.ts      # Definições de interfaces e tipos TypeScript
└── tests/            # Testes unitários automatizados com Jest
