export type GrowthStage = '육묘기' | '영양생장기' | '생식생장기' | '수확기' | '수확후정리';

export type TaskCategory = '관수/시비' | '환경관리' | '병해충방제' | '수확/정리' | '후속작업' | '기타';

export type TaskStatus = 'pending' | 'completed' | 'skipped' | 'issue';

export type TaskPriority = 'high' | 'medium' | 'low';

export type IssueCategory = '병해충' | '시설/장비 고장' | '기상/생육 이상' | '자재 부족' | '기타';

export interface Farm {
	id: string;
	name: string;
	region: string;
	crop: string;
	variety: string;
	planted_at: string; // YYYY-MM-DD
	growth_stage: GrowthStage;
	notes?: string;
	created_at?: string;
}

export interface Task {
	id: string;
	farm_id: string;
	title: string;
	description?: string;
	scheduled_date: string; // YYYY-MM-DD
	category: TaskCategory;
	status: TaskStatus;
	priority: TaskPriority;
	is_followup: boolean;
	parent_task_id?: string;
	created_at?: string;
}

export interface TaskLog {
	id: string;
	task_id: string;
	farm_id: string;
	action: 'completed' | 'skipped' | 'issue';
	note: string;
	photo_url?: string;
	issue_category?: IssueCategory;
	created_at: string;
}

export interface AIConsultation {
	id: string;
	farm_id: string;
	question: string;
	answer: string;
	summary_report?: string;
	created_at: string;
}

export interface FarmAdminSummary {
	farm: Farm;
	pending_count: number;
	completed_count: number;
	issue_count: number;
	recurring_issues: { category: IssueCategory; count: number }[];
	recent_logs: TaskLog[];
	risk_level: 'normal' | 'warning' | 'danger';
}
