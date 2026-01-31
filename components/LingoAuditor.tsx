'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Brain, Zap, AlertTriangle, CheckCircle } from 'lucide-react'

// "Lingo.dev" auditor logic
// 100% Client Side, Real-time, No API Lag

export const LingoAuditor = ({ content }: { content: string }) => {
    const [score, setScore] = useState(100)
    const [auditLog, setAuditLog] = useState<string[]>([])
    const [tokenCount, setTokenCount] = useState(0)

    useEffect(() => {
        analyze(content)
    }, [content])

    const analyze = (text: string) => {
        if (!text) {
            setScore(100)
            setAuditLog([])
            setTokenCount(0)
            return
        }

        let tempScore = 100
        const logs = []

        // 1. Glossary Compliance
        const glossaryTerms = ['Lingo.dev', 'Hackathon', 'API']
        let glossaryFound = 0
        glossaryTerms.forEach(term => {
            if (new RegExp(term, 'i').test(text)) {
                glossaryFound++
            }
        })
        if (glossaryFound > 0) {
            logs.push(`✅ Protected Branding Found: ${glossaryFound} terms`)
        }

        // 2. Token Estimation (Approx 4 chars per token)
        const tokens = Math.ceil(text.length / 4)
        setTokenCount(tokens)

        // 3. Sentence Complexity (Simulated AI)
        // Longer sentences are harder to translate accurately.
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
        let tooLong = 0
        sentences.forEach(s => {
            if (s.split(' ').length > 20) {
                tooLong++
                tempScore -= 10
            }
        })

        if (tooLong > 0) {
            logs.push(`⚠️ ${tooLong} sentences are too complex for AI.`)
        } else {
            logs.push(`✨ Text structure is optimal for translation.`)
        }

        setScore(Math.max(0, tempScore))
        setAuditLog(logs)
    }

    return (
        <div className="bg-black/40 border border-gray-700/50 rounded-xl p-4 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                        <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Lingo Auditor</h3>
                        <span className="text-[10px] text-green-400 flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Live Analysis
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Quality</span>
                    <span className={`text-xl font-black ${score > 80 ? 'text-green-400' : score > 50 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                        {score}/100
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <span className="text-[10px] text-gray-500 block uppercase">Tokens</span>
                        <span className="text-white font-mono text-xs">{tokenCount}</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <span className="text-[10px] text-gray-500 block uppercase">Est. Cost</span>
                        <span className="text-white font-mono text-xs">${(tokenCount * 0.00002).toFixed(5)}</span>
                    </div>
                </div>

                {/* Audit Logs */}
                <div className="space-y-1 pt-2 border-t border-gray-700/50">
                    {auditLog.length === 0 ? (
                        <span className="text-xs text-gray-500 italic">Waiting for content...</span>
                    ) : (
                        auditLog.map((log, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-xs text-gray-300 flex items-start gap-1.5"
                            >
                                <span className="opacity-70 mt-0.5">•</span>
                                {log}
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
