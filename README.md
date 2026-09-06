# 🎰 LotoVantagem - Ranking & Análise Estatística de Loterias Caixa

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.21-blue?logo=express)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-v3-003B57?logo=sqlite)](https://www.sqlite.org/)
[![Chart.js](https://img.shields.io/badge/Chart.js-v4-FF6384?logo=chartdotjs)](https://www.chartjs.org/)
[![License](https://img.shields.io/badge/License-ISC-brightgreen.svg)](LICENSE)

O **LotoVantagem** é um aplicativo completo de análise matemática e ranking estatístico dos sorteios da **Caixa Econômica Federal**. O projeto avalia em tempo real quais loterias são matematicamente mais vantajosas no momento, calculando o **Retorno Médio Esperado ($EV$)** de cada aposta.

---

## 📐 Como Funciona o Cálculo?

O **Retorno Médio Esperado** representa o valor estatístico teórico retornado para cada aposta efetuada, calculado a partir da fórmula:

$$\text{Retorno Médio (R\$)} = \text{valorEstimadoProximoConcurso} \times \text{Probabilidade}$$

- **`valorEstimadoProximoConcurso`**: Capturado em tempo real via API oficial para a próxima estimativa de prêmio.
- **`Probabilidade`**: Chance oficial de acerto da aposta principal (extraída da base `lot.json`).

---

## ✨ Principais Funcionalidades

- 🏆 **Ranking de Vantagem em Tempo Real**: Ordenação automática das loterias da mais vantajosa para a menos vantajosa com pódio dos campeões (#1, #2 e #3).
- 📈 **Gráfico Interativo de Evolução Histórica**: Gráfico de linhas em **Chart.js** exibindo a evolução temporal do Retorno Médio à medida que os prêmios acumulam (com controle rigoroso de 1 ponto por data).
- 💾 **Persistência Local em Banco de Dados SQLite**: Armazenamento dos históricos em `loterias.db` garantindo funcionamento **100% offline** e atualização via Upsert.
- 🧮 **Simulador de Investimento em Apostas**: Digite ou selecione um valor total investido (ex: R$ 5, R$ 10, R$ 50, R$ 100) para calcular o retorno esperado acumulado.
- 🔀 **Modos de Visualização**: Alterne facilmente entre a visão em **Cards Grid** e **Tabela Comparativa Compacta**.
- 🔍 **Filtro & Busca**: Pesquise por nome e ordene por Retorno Médio, Prêmio Estimado, Probabilidade ou Ordem Alfabética.
- 🔍 **Modal de Detalhamento**: Exibe a demonstração passo a passo da fórmula, dezenas do último concurso e link para o JSON bruto da API.
- 📦 **Compilação em Arquivo Executável Standalone (`.exe`)**: Empacotamento via `@yao-pkg/pkg` gerando um executável único para Windows que abre automaticamente o navegador.

---

## 🎯 Loterias Analisadas

| Loteria | Probabilidade Oficial | Endpoint API Caixa |
| :--- | :---: | :--- |
| **Mega-Sena** | `3.32908143053026e-9` | `https://loteriascaixa-api.herokuapp.com/api/megasena/latest` |
| **Quina** | `1.38657700283283e-8` | `https://loteriascaixa-api.herokuapp.com/api/quina/latest` |
| **Lotofácil** | `8.74075446696257e-8` | `https://loteriascaixa-api.herokuapp.com/api/lotofacil/latest` |
| **Super Sete** | `3.33333333333333e-8` | `https://loteriascaixa-api.herokuapp.com/api/supersete/latest` |
| **Lotomania** | `2.93101232329476e-8` | `https://loteriascaixa-api.herokuapp.com/api/lotomania/latest` |
| **Dupla Sena** | `2.09766299365876e-8` | `https://loteriascaixa-api.herokuapp.com/api/duplasena/latest` |
| **Timemania** | `1.07928154537187e-8` | `https://loteriascaixa-api.herokuapp.com/api/timemania/latest` |
| **Dia de Sorte** | `1.52115836209273e-7` | `https://loteriascaixa-api.herokuapp.com/api/diadesorte/latest` |
| **+Milionária** | `6.99220997886255e-10` | `https://loteriascaixa-api.herokuapp.com/api/maismilionaria/latest` |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Git

### 1. Clonar o Repositório
```bash
git clone https://github.com/JoshuaNclls/Calculadora-de-Loterias.git
cd Calculadora-de-Loterias
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Iniciar o Servidor
```bash
npm start
```
Acesse no seu navegador: **`http://localhost:3000`**

---

## 📦 Gerando o Arquivo Executável (.exe)

Para criar um aplicativo executável para Windows totalmente autocontido:

```bash
npm run build:exe
```
O executável será gerado em `dist/LotoVantagem.exe`. Ao dar um duplo clique nele, o servidor e a interface web serão inicializados automaticamente no seu navegador.

---

## 📁 Estrutura de Arquivos

```
Calculadora-de-Loterias/
├── server.js            # Servidor Express, rotas da API e fallback offline
├── database.js          # Persistência SQLite (loterias.db), Upsert e histórico
├── lot.json             # Mapeamento oficial de loterias, URLs e probabilidades
├── package.json         # Dependências e scripts de build
├── public/
│   ├── index.html       # Interface HTML5 com suporte a Chart.js
│   ├── style.css        # Tema escuro moderno com glassmorphism e responsividade
│   └── app.js           # Lógica do cliente (gráficos, filtros e simulador ROI)
└── README.md            # Documentação do projeto
```

---

## ⚠️ Aviso Legal / Disclaimer

Este aplicativo foi desenvolvido para fins estritamente educativos, analíticos e de demonstração de cálculo estatístico de valor esperado (*Expected Value*). **Loterias são jogos de azar e não constituem modalidade de investimento financeiro**. 

---

## 📄 Licença

Este projeto está licenciado sob a licença [ISC](LICENSE).