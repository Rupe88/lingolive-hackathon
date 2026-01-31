#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 100% REAL DYNAMIC AUDIT
// This script actually scans your codebase searching for "Glossary Violations" and "Complexity Issues"

const GLOSSARY = ['Lingo.dev', 'Hackathon', 'API', 'Realtime', 'Supabase'];
const MAX_SENTENCE_LENGTH = 20;

console.log('\n🔍 Lingo.dev Dynamic Auditor v1.0.0');
console.log('====================================\n');

async function auditFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let violations = 0;
    let warnings = 0;

    console.log(`Checking file: ${path.basename(filePath)}...`);

    // 1. Glossary Check (Case Sensitivity)
    GLOSSARY.forEach(term => {
        // Find occurences that mess up casing, e.g. "lingo.dev" instead of "Lingo.dev"
        const regex = new RegExp(`\\b${term}\\b`, 'yi'); // 'i' flag for case-insensitive match
        // Actually we want to find mismatches. 
        // Simple logic: Find all case-insensitive, check if exact match.

        const allMatches = content.match(new RegExp(term, 'gi')) || [];
        allMatches.forEach(match => {
            if (match !== term) {
                console.log(`  ❌ Brand Violation: Found "${match}", expected "${term}"`);
                violations++;
            }
        });
    });

    // 2. Complexity Check
    lines.forEach((line, i) => {
        const sentences = line.split(/[.!?]/);
        sentences.forEach(s => {
            const wordCount = s.trim().split(/\s+/).length;
            if (wordCount > MAX_SENTENCE_LENGTH) {
                console.log(`  ⚠️  Complexity Check (Line ${i + 1}): Sentence too long (${wordCount} words). AI Translation may degrade.`);
                warnings++;
            }
        });
    });

    // 3. Token Estimation (Real Calculation)
    const tokens = Math.ceil(content.length / 4);
    const estimatedCost = (tokens * 0.00002).toFixed(5);

    console.log(`  💰 Tokens: ${tokens} | Est. Cost: $${estimatedCost}`);

    if (violations === 0 && warnings === 0) {
        console.log('  ✅ Status: PERFECT FOR TRANSLATION');
    } else {
        console.log(`  🚨 Status: ${violations} Violations, ${warnings} Warnings`);
    }
    console.log('---\n');
}

// Audit actual component files
const targetFiles = [
    'components/ChatRoom.tsx',
    'components/DocumentEditor.tsx',
    'app/page.tsx'
];

targetFiles.forEach(f => {
    if (fs.existsSync(f)) {
        auditFile(f);
    }
});
