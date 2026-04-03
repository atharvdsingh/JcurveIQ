export type AgentEventType =
    | 'TASK_STARTED'
    | 'TOOL_CALL'
    | 'TASK_COMPLETED'
    | 'TASK_CANCELLED';

export type TaskStatus = 'pending' | 'running' | 'completed' | 'cancelled';

export type CancelReason = 'sufficient_data' | 'timeout' | 'error';

export type ToolName =
    | 'google_search'
    | 'sec_parser'
    | 'calculator'
    | 'database_query'
    | 'web_scraper'
    | 'sentiment_analyzer';

export interface AgentEvent {
    id: string;
    type: AgentEventType;
    taskId: string;
    taskName: string;
    timestamp: number;
    startTime: number;
    thought?: string;
    tool?: ToolName;
    toolInput?: string;
    toolResult?: string;
    cancelReason?: CancelReason;
    dependencies?: string[];
    delay: number;
}

export interface Task {
    id: string;
    name: string;
    status: TaskStatus;
    thought: string;
    tool?: ToolName;
    toolInput?: string;
    toolResult?: string;
    cancelReason?: CancelReason;
    dependencies: string[];
    startTime: number;
    endTime?: number;
    parallelGroup?: string;
}
