import { FetchData } from '../fetchdata/fetchdata';
import { elizaLogger } from '@elizaos/core';
import fs from 'fs';
import path from 'path';

export class FetchDataService {
    private fetchdata: FetchData;

    constructor() {
        this.fetchdata = new FetchData();
    }

    async runFetchData(): Promise<void> {
        try {
            elizaLogger.info('Starting DeFi Llama API data fetching...');
            
            // Ensure the knowledge directories exist - fix the path by going up one level
            const knowledgeDir = path.resolve(process.cwd(), '..', 'characters', 'knowledge', 'LST');
            await fs.promises.mkdir(knowledgeDir, { recursive: true });
            
            // Temporarily modify the process.cwd() for the fetchdata call
            const originalCwd = process.cwd();
            process.chdir(path.resolve(process.cwd(), '..'));
            
            try {
                await this.fetchdata.runFetchData();
            } finally {
                // Restore the original working directory
                process.chdir(originalCwd);
            }
            
            elizaLogger.info('DeFi Llama data fetching completed successfully');
            
            // Verify files exist after operation
            const lstFilePath = path.join(knowledgeDir, "lst_pools_data.md");
            const defiFilePath = path.join(knowledgeDir, "defi_lst_pools_data.md");
            
            const lstExists = fs.existsSync(lstFilePath);
            const defiExists = fs.existsSync(defiFilePath);
            
            if (!lstExists || !defiExists) {
                elizaLogger.warn('One or more expected files do not exist after operation');
            }
        } catch (error) {
            elizaLogger.error('Error during DeFi Llama data fetching:', error);
            if (error instanceof Error) {
                elizaLogger.error(`Error message: ${error.message}`);
                elizaLogger.error(`Error stack: ${error.stack}`);
            }
            throw error; // Re-throw to allow the caller to handle it
        }
    }
} 