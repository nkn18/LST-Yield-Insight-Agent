# Kaia Staking Insight Agent 🤖

## 🚩 Overview

Kaia Staking Insight Agent is an AI-powered tool built on Eliza OS that provides insights for staking opportunities from selected staking platforms. Currently, it aggregates and analyzes staking data from three major staking providers to help users make informed decisions about their staking strategies.

## ✨ Features

- 🔍 Comprehensive Kaia chain staking analytics
- 📊 Kaia validator information tracking
- 💹 Up-to-date APR/APY data for Kaia staking
- 💬 Natural language queries for Kaia staking data

## 🚀 Quick Start

### Prerequisites

- [Node.js 23+](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [pnpm](https://pnpm.io/installation)
- For Puppeteer:
    ```bash
    # Install Chrome/Chromium
    apt-get install -y chromium-browser

    # Install other dependencies
    apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils
    ```

### Installation

```bash
git clone https://github.com/nkn18/kaia-staking-insight-agent.git
cd kaia-staking-insight-agent
cp .env.example .env
pnpm i && pnpm build && pnpm start
```

### Configuration

1. Copy `.env.example` to `.env` and fill in your API keys:
```bash
cp .env.example .env
```

2. Configure your character on `/characters/kaiastaking.character.json`

### Usage

Start the agent:
```bash
pnpm start --characters="/characters/kaiastaking.character.json`
```


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Built with [Eliza OS](https://github.com/elizaos/eliza) - An AI Agent Framework
