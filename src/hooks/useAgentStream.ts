import { useReducer, useRef, useCallback, useEffect } from 'react';
import type { AgentEvent, Task } from '../types/agent';
import { mockEvents } from '../data/mockEvents';

interface StreamState {
    tasks: Map<string, Task>;
    isStreaming: boolean;
    query: string;
}

const initialState: StreamState = {
    tasks: new Map(),
    isStreaming: false,
    query: '',
};

type Action =
    | { type: 'PROCESS_EVENT'; event: AgentEvent; parallelGroup?: string }
    | { type: 'STREAM_START'; query: string }
    | { type: 'STREAM_END' }
    | { type: 'RESET' };

function reducer(state: StreamState, action: Action): StreamState {
    switch (action.type) {
        case 'RESET':
            return { tasks: new Map(), isStreaming: false, query: '' };

        case 'STREAM_START':
            return { ...state, isStreaming: true, query: action.query };

        case 'STREAM_END':
            return { ...state, isStreaming: false };

        case 'PROCESS_EVENT': {
            const { event, parallelGroup } = action;
            const next = new Map(state.tasks);
            const existing = next.get(event.taskId);

            switch (event.type) {
                case 'TASK_STARTED': {
                    if (existing) {
                        next.set(event.taskId, {
                            ...existing,
                            status: 'running',
                            thought: event.thought ?? existing.thought,
                            parallelGroup: parallelGroup ?? existing.parallelGroup,
                        });
                    } else {
                        next.set(event.taskId, {
                            id: event.taskId,
                            name: event.taskName,
                            status: 'running',
                            thought: event.thought ?? '',
                            dependencies: event.dependencies ?? [],
                            startTime: event.startTime,
                            parallelGroup,
                        });
                    }
                    break;
                }

                case 'TOOL_CALL': {
                    if (existing) {
                        next.set(event.taskId, {
                            ...existing,
                            tool: event.tool,
                            toolInput: event.toolInput,
                            toolResult: event.toolResult,
                            thought: event.thought ?? existing.thought,
                        });
                    }
                    break;
                }

                case 'TASK_COMPLETED': {
                    if (existing) {
                        next.set(event.taskId, {
                            ...existing,
                            status: 'completed',
                            thought: event.thought ?? existing.thought,
                            endTime: event.timestamp,
                        });
                    }
                    break;
                }

                case 'TASK_CANCELLED': {
                    if (existing) {
                        next.set(event.taskId, {
                            ...existing,
                            status: 'cancelled',
                            cancelReason: event.cancelReason,
                            thought: event.thought ?? existing.thought,
                            endTime: event.timestamp,
                        });
                    }
                    break;
                }
            }

            return { ...state, tasks: next };
        }

        default:
            return state;
    }
}

function buildParallelGroups(events: AgentEvent[]): Map<string, string> {
    const byStartTime = new Map<number, string[]>();
    for (const evt of events) {
        if (evt.type === 'TASK_STARTED') {
            const group = byStartTime.get(evt.startTime) ?? [];
            group.push(evt.taskId);
            byStartTime.set(evt.startTime, group);
        }
    }

    const taskToGroup = new Map<string, string>();
    for (const [startTime, taskIds] of byStartTime) {
        if (taskIds.length > 1) {
            const groupId = `parallel-${startTime}`;
            for (const id of taskIds) {
                taskToGroup.set(id, groupId);
            }
        }
    }
    return taskToGroup;
}

export function useAgentStream() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
    const parallelGroups = useRef<Map<string, string>>(buildParallelGroups(mockEvents));

    const stop = useCallback(() => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
    }, []);

    const start = useCallback((query: string) => {
        timers.current.forEach(clearTimeout);
        timers.current = [];

        dispatch({ type: 'RESET' });
        parallelGroups.current = buildParallelGroups(mockEvents);

        const initTimer = setTimeout(() => {
            dispatch({ type: 'STREAM_START', query });

            let cumulativeDelay = 0;

            mockEvents.forEach((event) => {
                cumulativeDelay += event.delay;
                const timer = setTimeout(() => {
                    dispatch({
                        type: 'PROCESS_EVENT',
                        event,
                        parallelGroup: parallelGroups.current.get(event.taskId),
                    });
                }, cumulativeDelay);
                timers.current.push(timer);
            });

            const endTimer = setTimeout(() => {
                dispatch({ type: 'STREAM_END' });
            }, cumulativeDelay + 600);
            timers.current.push(endTimer);
        }, 50);

        timers.current.push(initTimer);
    }, []);

    useEffect(() => {
        return () => {
            timers.current.forEach(clearTimeout);
            timers.current = [];
        };
    }, [stop]);

    const tasks = Array.from(state.tasks.values());

    return { tasks, isStreaming: state.isStreaming, query: state.query, start };
}
