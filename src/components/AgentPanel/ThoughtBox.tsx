import { useState } from 'react';
import { ChevronDown, ChevronRight, Terminal } from 'lucide-react';

interface ThoughtBoxProps {
    thought: string;
    defaultOpen?: boolean;
}

export default function ThoughtBox({ thought, defaultOpen = false }: ThoughtBoxProps) {
    const [open, setOpen] = useState(defaultOpen);

    if (!thought) return null;

    return (
        <div className="mt-3">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer font-medium"
            >
                {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                <Terminal size={12} />
                <span>reasoning</span>
            </button>

            {open && (
                <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-950 p-3 font-mono text-[12px] leading-relaxed text-neutral-400 overflow-x-auto animate-[fadeIn_0.2s_ease-out]">
                    <span className="text-neutral-600 select-none mr-2">{'>'}</span>
                    {thought}
                </div>
            )}
        </div>
    );
}
