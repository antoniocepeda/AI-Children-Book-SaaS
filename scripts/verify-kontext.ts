/**
 * Quick verification script for Kontext Dev model access
 * Run with: npx ts-node scripts/verify-kontext.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import Replicate from 'replicate';

async function verifyKontextAccess() {
    console.log('🔍 Verifying Replicate API access to FLUX Kontext Dev...\n');

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
        console.error('❌ Missing REPLICATE_API_TOKEN environment variable');
        process.exit(1);
    }

    const replicate = new Replicate({ auth: apiToken });
    const modelId = 'black-forest-labs/flux-kontext-dev';

    try {
        // Get model info to verify access
        const model = await replicate.models.get('black-forest-labs', 'flux-kontext-dev');

        console.log('✅ Model access verified!');
        console.log(`   Model: ${model.owner}/${model.name}`);
        console.log(`   Description: ${model.description?.substring(0, 100)}...`);
        console.log(`   Visibility: ${model.visibility}`);
        console.log(`   Latest version: ${model.latest_version?.id || 'N/A'}`);
        console.log('\n🎉 Ready to use FLUX Kontext Dev for character consistency!');

    } catch (error) {
        console.error('❌ Failed to access model:', error);
        console.error('\nPossible issues:');
        console.error('  1. Invalid API token');
        console.error('  2. Model not available on Replicate');
        console.error('  3. Account lacks permissions');
        process.exit(1);
    }
}

verifyKontextAccess();
