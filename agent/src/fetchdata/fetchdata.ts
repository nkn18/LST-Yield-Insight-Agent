import fs from "fs";
import axios from "axios";
import path from "path";
import { elizaLogger } from "@elizaos/core";

export class FetchData {
  async runFetchData(): Promise<void> {
    const API_URL = "https://yields.llama.fi/pools";
    const lstProjects = [
      "lido",
      "binance-staked-eth",
      "rocket-pool",
      "meth-protocol",
      "stakewise-v2",
      "coinbase-wrapped-staked-eth",
      "frax-ether",
      "origin-ether",
      "liquid-collective",
      "dinero-(pxeth)",
      "swell-liquid-staking",
      "stake.link-liquid",
      "bifrost-liquid-staking",
      "ankr",
      "stafi",
      "hord",
      "meta-pool-eth",
      "mev-protocol",
      "tranchess-ether"
    ];

    // Track if files have changed to determine if restart is needed
    let filesChanged = false;
    let oldLstContent = "";
    let oldDefiContent = "";
    
    // Define file paths
    const knowledgeDir = path.resolve(process.cwd(), 'characters', 'knowledge', 'LST');
    const lstFilePath = path.join(knowledgeDir, "lst_pools_data.md");
    const defiFilePath = path.join(knowledgeDir, "defi_lst_pools_data.md");
    
    try {
      // Check if files exist and read their content
      try {
        if (fs.existsSync(lstFilePath)) {
          oldLstContent = fs.readFileSync(lstFilePath, 'utf8');
        }
        if (fs.existsSync(defiFilePath)) {
          oldDefiContent = fs.readFileSync(defiFilePath, 'utf8');
        }
      } catch (readError) {
        elizaLogger.warn(`Could not read existing files: ${readError.message}`);
      }

      // Fetch data from API
      elizaLogger.debug(`Fetching data from ${API_URL}...`);
      const res = await axios.get(API_URL);
      const allPools = res.data.data;
      elizaLogger.debug(`Received ${allPools.length} pools from API`);

      // 1. Filter for LST Pools with non-zero APY
      const lstPools = allPools.filter((p: any) => 
        lstProjects.includes(p.project) && 
        p.apy > 0
      );
      elizaLogger.debug(`Found ${lstPools.length} LST pools with positive APY`);

      // 2. Dynamically get relevant LST keywords from symbols
      const lstKeywords = new Set<string>();
      lstPools.forEach((p: any) => {
        if (p.symbol) {
          p.symbol.split(/[-_/]/).forEach((k: string) => lstKeywords.add(k.trim().toUpperCase()));
        }
      });

      // 3. Find DeFi Pools using any of those keywords, with non-zero APY
      const defiPools = allPools.filter((p: any) => {
        if (lstProjects.includes(p.project)) return false; // skip LST pools again
        if (p.apy <= 0) return false; // skip zero APY pools
        return Array.from(lstKeywords).some(keyword => p.symbol?.toUpperCase().includes(keyword));
      });
      elizaLogger.debug(`Found ${defiPools.length} DeFi pools utilizing LSTs with positive APY`);

      
      // 4. Create LST Pools Markdown file
      const timestamp = new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/,/g, '');

      let lstOutput = `# 📊 LST Yield Data \n`;
      lstOutput += `This document contains data on Liquid Staking Token (LST) Pools with positive APY.\n\n`;
      lstOutput += `Last updated: ${timestamp}\n\n`;
      lstOutput += `## LST Pools Overview\n\n`;
      lstOutput += `Total Pools: ${lstPools.length}\n`;
      lstOutput += `Average APY: ${(lstPools.reduce((sum, p) => sum + p.apy, 0) / lstPools.length).toFixed(2)}%\n`;
      lstOutput += `Total TVL: $${Math.round(lstPools.reduce((sum, p) => sum + p.tvlUsd, 0)).toLocaleString()}\n\n`;

      // Sort LST pools by TVL
      lstPools.sort((a, b) => b.tvlUsd - a.tvlUsd);

      // LST Pools details
      lstOutput += `## LST Projects by TVL\n\n`;
      lstPools.forEach((pool: any) => {
        lstOutput += `### ${pool.project} (${pool.symbol}) on ${pool.chain}\n\n`;
        lstOutput += `- TVL: $${Math.round(pool.tvlUsd).toLocaleString()}\n`;
        lstOutput += `- Base APY: ${pool.apyBase?.toFixed(2) || 'N/A'}%\n`;
        lstOutput += `- Reward APY: ${pool.apyReward?.toFixed(2) || '0.00'}%\n`;
        lstOutput += `- Total APY: ${pool.apy?.toFixed(2)}%\n`;
        
        // Add APY trend data in the new format
        const trend1D = pool.apyPct1D > 0 ? '↑' : pool.apyPct1D < 0 ? '↓' : '→';
        const trend7D = pool.apyPct7D > 0 ? '↑' : pool.apyPct7D < 0 ? '↓' : '→';
        const trend30D = pool.apyPct30D > 0 ? '↑' : pool.apyPct30D < 0 ? '↓' : '→';
        
        const trend1DValue = pool.apyPct1D !== undefined ? `${trend1D} ${Math.abs(pool.apyPct1D).toFixed(2)}%` : 'N/A';
        const trend7DValue = pool.apyPct7D !== undefined ? `${trend7D} ${Math.abs(pool.apyPct7D).toFixed(2)}%` : 'N/A';
        const trend30DValue = pool.apyPct30D !== undefined ? `${trend30D} ${Math.abs(pool.apyPct30D).toFixed(2)}%` : 'N/A';
        
        lstOutput += `- APY Trends (1d/7d/30d): ${trend1DValue} / ${trend7DValue} / ${trend30DValue}\n`;
        
        // Add prediction data if available
        if (pool.predictions) {
          const confidenceMap: {[key: number]: string} = {1: "Low", 2: "Medium", 3: "High"};
          const confidence = confidenceMap[pool.predictions.binnedConfidence] || "Unknown";
          lstOutput += `- APY Prediction: ${pool.predictions.predictedClass} (${pool.predictions.predictedProbability}% probability, ${confidence} confidence)\n`;
        }
        
        lstOutput += `- Exposure: ${pool.exposure}\n\n`;
      });

      // 5. Create DeFi Pools Markdown file
      let defiOutput = `# 📊 DeFi Pools Utilizing LSTs \n`;
      defiOutput += `This document contains data on DeFi Pools utilizing LSTs for additional yield, with positive APY.\n\n`;
      defiOutput += `Last updated: ${timestamp}\n\n`;
      defiOutput += `## DeFi Pools Overview\n\n`;
      defiOutput += `Total Pools: ${defiPools.length}\n`;
      defiOutput += `Average APY: ${(defiPools.reduce((sum, p) => sum + p.apy, 0) / defiPools.length).toFixed(2)}%\n`;
      defiOutput += `Total TVL: $${Math.round(defiPools.reduce((sum, p) => sum + p.tvlUsd, 0)).toLocaleString()}\n\n`;

      // Sort DeFi pools by APY (highest first)
      defiPools.sort((a, b) => b.apy - a.apy);

      // Group DeFi pools by project for better organization
      const projectGroups: {[key: string]: any[]} = {};
      defiPools.forEach(pool => {
        if (!projectGroups[pool.project]) {
          projectGroups[pool.project] = [];
        }
        projectGroups[pool.project].push(pool);
      });

      // DeFi Pools details - grouped by project
      defiOutput += `## Top DeFi Projects Utilizing LSTs\n\n`;
      
      Object.keys(projectGroups).forEach(project => {
        const pools = projectGroups[project];
        const totalTvl = pools.reduce((sum, p) => sum + p.tvlUsd, 0);
        const avgApy = pools.reduce((sum, p) => sum + p.apy, 0) / pools.length;
        
        defiOutput += `### ${project}\n\n`;
        defiOutput += `- Total TVL: $${Math.round(totalTvl).toLocaleString()}\n`;
        defiOutput += `- Average APY: ${avgApy.toFixed(2)}%\n`;
        defiOutput += `- Number of Pools: ${pools.length}\n`;
        defiOutput += `- Chains: ${[...new Set(pools.map(p => p.chain))].join(', ')}\n\n`;
        
        pools.forEach((pool: any) => {
          // Keep project name in the heading
          defiOutput += `#### ${project}: ${pool.symbol} on ${pool.chain}\n\n`;
          defiOutput += `- TVL: $${Math.round(pool.tvlUsd).toLocaleString()}\n`;
          defiOutput += `- Base APY: ${pool.apyBase?.toFixed(2) || 'N/A'}%\n`;
          defiOutput += `- Reward APY: ${pool.apyReward?.toFixed(2) || '0.00'}%\n`;
          defiOutput += `- Total APY: ${pool.apy?.toFixed(2)}%\n`;
          
          // Add APY trend data in the new format
          const trend1D = pool.apyPct1D > 0 ? '↑' : pool.apyPct1D < 0 ? '↓' : '→';
          const trend7D = pool.apyPct7D > 0 ? '↑' : pool.apyPct7D < 0 ? '↓' : '→';
          const trend30D = pool.apyPct30D > 0 ? '↑' : pool.apyPct30D < 0 ? '↓' : '→';
          
          const trend1DValue = pool.apyPct1D !== undefined ? `${trend1D} ${Math.abs(pool.apyPct1D).toFixed(2)}%` : 'N/A';
          const trend7DValue = pool.apyPct7D !== undefined ? `${trend7D} ${Math.abs(pool.apyPct7D).toFixed(2)}%` : 'N/A';
          const trend30DValue = pool.apyPct30D !== undefined ? `${trend30D} ${Math.abs(pool.apyPct30D).toFixed(2)}%` : 'N/A';
          
          defiOutput += `- APY Trends (1d/7d/30d): ${trend1DValue} / ${trend7DValue} / ${trend30DValue}\n`;
          
          // Add prediction data if available
          if (pool.predictions) {
            const confidenceMap: {[key: number]: string} = {1: "Low", 2: "Medium", 3: "High"};
            const confidence = confidenceMap[pool.predictions.binnedConfidence] || "Unknown";
            defiOutput += `- APY Prediction: ${pool.predictions.predictedClass} (${pool.predictions.predictedProbability}% probability, ${confidence} confidence)\n`;
          }
          
          defiOutput += `- Exposure: ${pool.exposure}\n\n`;
        });
        
        defiOutput += `---\n\n`;
      });

      // Ensure directory exists
      try {
        await fs.promises.mkdir(knowledgeDir, { recursive: true });
        elizaLogger.debug(`Created or verified directory: ${knowledgeDir}`);
      } catch (dirError) {
        elizaLogger.error(`Failed to create directory ${knowledgeDir}:`, dirError);
        throw dirError;
      }
      
      const lstContentWithoutTimestamp = lstOutput.replace(/Last updated: .+\n\n/, '');
      const defiContentWithoutTimestamp = defiOutput.replace(/Last updated: .+\n\n/, '');

      // Check if content has changed before writing
      if (lstContentWithoutTimestamp !== oldLstContent.replace(/Last updated: .+\n\n/, '')) {
        filesChanged = true;
        elizaLogger.debug(`LST data has changed, updating file`);
      }
      
      if (defiContentWithoutTimestamp !== oldDefiContent.replace(/Last updated: .+\n\n/, '')) {
        filesChanged = true;
        elizaLogger.debug(`DeFi data has changed, updating file`);
      }
      
      // Write files
      try {
        elizaLogger.debug(`Writing LST data to ${lstFilePath}`);
        await fs.promises.writeFile(lstFilePath, lstOutput);
        elizaLogger.debug(`Successfully wrote to ${lstFilePath}`);
      } catch (writeError) {
        elizaLogger.error(`Failed to write to ${lstFilePath}:`, writeError);
        throw writeError;
      }
      
      try {
        elizaLogger.debug(`Writing DeFi data to ${defiFilePath}`);
        await fs.promises.writeFile(defiFilePath, defiOutput);
        elizaLogger.debug(`Successfully wrote to ${defiFilePath}`);
      } catch (writeError) {
        elizaLogger.error(`Failed to write to ${defiFilePath}:`, writeError);
        throw writeError;
      }
      
      elizaLogger.info("✅ Data split into two files:");
      elizaLogger.info(`   - ${lstFilePath}: LST pools data`);
      elizaLogger.info(`   - ${defiFilePath}: DeFi pools utilizing LSTs`);
      elizaLogger.info(`Found ${lstPools.length} LST pools and ${defiPools.length} related DeFi pools with positive APY`);
      elizaLogger.info(`LST Keywords identified: ${Array.from(lstKeywords).join(', ')}`);
      
      // If files changed, exit process to trigger restart
      if (filesChanged) {
        elizaLogger.info("Knowledge files have been updated. Exiting process to trigger restart...");
        // Give a moment for logs to be written
        await new Promise(resolve => setTimeout(resolve, 1000));
        process.exit(0);
      }
    
    } catch (error) {
      elizaLogger.error("Error fetching or processing data:", error);
      if (error instanceof Error) {
        elizaLogger.error(`Error message: ${error.message}`);
        elizaLogger.error(`Error stack: ${error.stack}`);
      }
      throw error; // Re-throw to allow the caller to handle it
    }
  }
}