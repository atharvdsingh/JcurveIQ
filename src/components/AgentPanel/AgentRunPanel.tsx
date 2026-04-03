import { useState, useEffect, useRef } from 'react';
import { Activity, Send, Radio, ArrowRight } from 'lucide-react';
import type { Task } from '../../types/agent';
import { useAgentStream } from '../../hooks/useAgentStream';
import TaskCard from './TaskCard';
import ParallelGroup from './ParallelGroup';

function groupTasksForRender(tasks: Task[]) {
    const rendered = new Set<string>();
    const groups: Array<{ type: 'single'; task: Task } | { type: 'parallel'; tasks: Task[]; groupId: string }> = [];

    for (const task of tasks) {
        if (rendered.has(task.id)) continue;

        if (task.parallelGroup) {
            const siblings = tasks.filter(
                (t) => t.parallelGroup === task.parallelGroup && !rendered.has(t.id)
            );
            if (siblings.length > 1) {
                siblings.forEach((s) => rendered.add(s.id));
                groups.push({ type: 'parallel', tasks: siblings, groupId: task.parallelGroup });
            } else {
                rendered.add(task.id);
                groups.push({ type: 'single', task });
            }
        } else {
            rendered.add(task.id);
            groups.push({ type: 'single', task });
        }
    }

    return groups;
}

function getStats(tasks: Task[]) {
    let completed = 0;
    let running = 0;
    let cancelled = 0;
    for (const t of tasks) {
        if (t.status === 'completed') completed++;
        else if (t.status === 'running') running++;
        else if (t.status === 'cancelled') cancelled++;
    }
    return { completed, running, cancelled, total: tasks.length };
}

const SUGGESTIONS = [
    'Analyze my portfolio risk exposure',
    'Run a sentiment analysis on AAPL',
    'Calculate VaR for my holdings',
];

export default function AgentRunPanel() {
    const { tasks, isStreaming, query, start } = useAgentStream();
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [tasks.length]);

    const handleSubmit = (text?: string) => {
        const q = (text ?? input).trim();
        if (!q || isStreaming) return;
        setInput('');
        start(q);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const groups = groupTasksForRender(tasks);
    const stats = getStats(tasks);
    const hasResults = tasks.length > 0 || isStreaming;

    return (
        <div className="flex flex-col h-screen bg-black text-white font-sans">
            <header className="shrink-0 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md px-6 py-4">
                <div className="flex items-center justify-between max-w-5xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-neutral-800">
                            <Activity size={16} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-semibold tracking-tight">Agent Run</h1>
                            <p className="text-[11px] text-neutral-500">Financial AI Assistant</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                        {isStreaming && (
                            <span className="flex items-center gap-1.5">
                                <Radio size={10} className="text-white animate-pulse" />
                                <span className="text-white">Live</span>
                            </span>
                        )}
                        {!isStreaming && tasks.length > 0 && (
                            <span className="text-neutral-500">Complete</span>
                        )}
                        {tasks.length > 0 && (
                            <span className="text-neutral-600">
                                {stats.completed}/{stats.total} tasks
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {tasks.length > 0 && (
                <div className="shrink-0 h-[2px] bg-neutral-900">
                    <div
                        className="h-full bg-gradient-to-r from-white/80 to-white/40 transition-all duration-700 ease-out"
                        style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                    />
                </div>
            )}

            <div ref={scrollRef} className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">

                    {!hasResults && (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-neutral-800 mb-5">
                                <Activity size={22} className="text-neutral-500" />
                            </div>
                            <h2 className="text-lg font-semibold text-neutral-200 mb-1">What would you like to analyze?</h2>
                            <p className="text-[13px] text-neutral-600 mb-8">Ask a question and the agent will stream its work in real-time.</p>

                            <div className="flex flex-wrap gap-2 justify-center">
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleSubmit(s)}
                                        className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80 hover:border-neutral-700 px-4 py-2.5 text-[12px] text-neutral-400 hover:text-neutral-200 transition-all cursor-pointer"
                                    >
                                        <ArrowRight size={12} className="text-neutral-600" />
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {query && (
                        <div className="pb-3 mb-1 border-b border-neutral-800/60">
                            <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-1.5">Query</p>
                            <p className="text-[14px] text-neutral-200 font-medium">{query}</p>
                        </div>
                    )}

                    {groups.map((group) => {
                        if (group.type === 'parallel') {
                            return (
                                <ParallelGroup
                                    key={group.groupId}
                                    tasks={group.tasks}
                                    allTasks={tasks}
                                />
                            );
                        }
                        return (
                            <TaskCard
                                key={group.task.id}
                                task={group.task}
                                allTasks={tasks}
                            />
                        );
                    })}

                    {isStreaming && (
                        <div className="flex items-center gap-2 py-2 text-[11px] text-neutral-600 animate-pulse">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                            <span>Processing…</span>
                        </div>
                    )}
                </div>
            </div>

            {tasks.length > 0 && (
                <div className="shrink-0 border-t border-neutral-800/60 bg-neutral-950/60 px-6 py-2">
                    <div className="max-w-5xl mx-auto flex items-center gap-6 text-[10px] uppercase tracking-widest text-neutral-600">
                        <span className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            {stats.completed} completed
                        </span>
                        <span className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
                            {stats.running} running
                        </span>
                        {stats.cancelled > 0 && (
                            <span className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                {stats.cancelled} optimized
                            </span>
                        )}
                    </div>
                </div>
            )}

            <div className="shrink-0 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur-md px-6 py-4">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 focus-within:border-neutral-600 transition-colors">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isStreaming ? 'Agent is working…' : 'Ask a question…'}
                            disabled={isStreaming}
                            className="flex-1 bg-transparent text-[13px] text-neutral-200 placeholder:text-neutral-600 outline-none disabled:opacity-50"
                        />
                        <button
                            onClick={() => handleSubmit()}
                            disabled={!input.trim() || isStreaming}
                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <Send size={14} className="text-white" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
