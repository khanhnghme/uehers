
-- =============================================
-- MIGRATION 1: Add missing columns to profiles
-- =============================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_by UUID;

-- Add missing column to groups
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS activity_logging_enabled BOOLEAN DEFAULT true;

-- =============================================
-- INDEXES (missing performance indexes)
-- =============================================
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON public.profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_groups_slug ON public.groups(slug);
CREATE INDEX IF NOT EXISTS idx_groups_share_token ON public.groups(share_token);
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON public.groups(created_by);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_stages_group ON public.stages(group_id);
CREATE INDEX IF NOT EXISTS idx_tasks_group ON public.tasks(group_id);
CREATE INDEX IF NOT EXISTS idx_tasks_stage ON public.tasks(stage_id);
CREATE INDEX IF NOT EXISTS idx_tasks_slug ON public.tasks(slug);
CREATE INDEX IF NOT EXISTS idx_task_assignments_task ON public.task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_user ON public.task_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_submission_history_task ON public.submission_history(task_id);
CREATE INDEX IF NOT EXISTS idx_submission_history_user ON public.submission_history(user_id);
CREATE INDEX IF NOT EXISTS idx_task_scores_task ON public.task_scores(task_id);
CREATE INDEX IF NOT EXISTS idx_task_scores_user ON public.task_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_stage_scores_stage ON public.member_stage_scores(stage_id);
CREATE INDEX IF NOT EXISTS idx_stage_scores_user ON public.member_stage_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_final_scores_group ON public.member_final_scores(group_id);
CREATE INDEX IF NOT EXISTS idx_final_scores_user ON public.member_final_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_appeals_user ON public.score_appeals(user_id);
CREATE INDEX IF NOT EXISTS idx_appeals_status ON public.score_appeals(status);
CREATE INDEX IF NOT EXISTS idx_appeal_attachments ON public.appeal_attachments(appeal_id);
CREATE INDEX IF NOT EXISTS idx_adjustment_history_user ON public.score_adjustment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_adjustment_history_type ON public.score_adjustment_history(adjustment_type);
CREATE INDEX IF NOT EXISTS idx_task_notes_task ON public.task_notes(task_id);
CREATE INDEX IF NOT EXISTS idx_task_notes_created ON public.task_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_note_attachments ON public.task_note_attachments(note_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_parent ON public.task_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_project_messages_group ON public.project_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_project_messages_time ON public.project_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mentions_user ON public.message_mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_unread ON public.message_mentions(mentioned_user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_time ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_group ON public.activity_logs(group_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_time ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON public.activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_resources_group ON public.project_resources(group_id);
CREATE INDEX IF NOT EXISTS idx_resources_folder ON public.project_resources(folder_id);
CREATE INDEX IF NOT EXISTS idx_folders_group ON public.resource_folders(group_id);
CREATE INDEX IF NOT EXISTS idx_pending_group ON public.pending_approvals(group_id);
CREATE INDEX IF NOT EXISTS idx_pending_status ON public.pending_approvals(status);
CREATE INDEX IF NOT EXISTS idx_feedbacks_user ON public.feedbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON public.feedbacks(status);
CREATE INDEX IF NOT EXISTS idx_feedback_comments ON public.feedback_comments(feedback_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_type ON public.system_error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_time ON public.system_error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_user ON public.system_error_logs(user_id);
