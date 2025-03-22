# LST Yield Insight Agent 🤖

## 🚩 Overview

LST Yield Insight Agent is an AI-powered analytics expert built on Eliza OS that provides comprehensive data-driven insights for Liquid Staking Tokens (LSTs) and DeFi pools utilizing LSTs. The agent helps users make informed decisions about staking strategies and guides them toward advanced yield optimization techniques to maximize returns.

## ✨ Features

- 📊 Tracks APYs across 33+ LST pools with $27B+ in TVL
- 🔄 Monitors 550+ DeFi pools utilizing LSTs with APRs 
- 📈 Provides trend data with 1-day, 7-day, and 30-day APY movements
- 🔮 Includes prediction confidence metrics for future yield stability
- 🌐 Analyzes pools across Ethereum, Bifrost, BSC, Arbitrum and other chains
- 💹 Compares yields across major LST providers including Lido, Rocket Pool, Bifrost,etc
- 🛡️ Evaluates risk-adjusted returns for different LST yield strategies
- 🚀 Identifies optimal yield stacking strategies combining LSTs with DeFi protocols

## 🚀 Quick Start

### Prerequisites

- [Node.js 23+](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [pnpm](https://pnpm.io/installation)

### Installation

```bash
git clone https://github.com/nkn18/lst-yield-insight-agent.git
cd lst-yield-insight-agent
cp .env.example .env
pnpm i && pnpm build && pnpm start
```

### Configuration

1. Copy `.env.example` to `.env` and fill in your API keys:
```bash
cp .env.example .env
```

2. Configure your character on `/characters/LST.character.json`

### Usage

Start the agent:
```bash
pnpm start --characters="/characters/LST.character.json"
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Built with [Eliza OS](https://github.com/elizaos/eliza) - An AI Agent Framework
