import React, { useEffect, useState } from "react";
import InputField, { TextAreaField, SelectField } from "./InputField";
import { LeadPayload } from "../services/leadService";
import { userService } from "../services/userService";
import { leadSourceService, LeadSource } from "../services/leadSourceService";
import { tagService, Tag } from "../services/tagService";
import { Mail, Phone as PhoneIcon, User as UserIcon, Building as BuildingIcon, Briefcase as BriefcaseIcon, ListFilter, UserCheck, Tags } from "lucide-react";

export interface LeadFormProps {
	initial?: LeadPayload;
	onSubmit: (data: LeadPayload) => Promise<void> | void;
	submitting?: boolean;
}

const defaultState: LeadPayload = {
	firstName: "",
	lastName: "",
	email: "",
	phone: "",
	company: "",
	position: "",
	sourceId: undefined,
	status: "new",
	notes: "",
	assignedTo: undefined,
	tags: [],
};

const LeadForm: React.FC<LeadFormProps> = ({ initial, onSubmit, submitting }) => {
	const [form, setForm] = useState<LeadPayload>({ ...defaultState, ...(initial || {}) });
	const [users, setUsers] = useState<Array<{ id: number; firstName: string; lastName: string }>>([]);
	const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
	const [allTags, setAllTags] = useState<Tag[]>([]);

	useEffect(() => {
		if (initial) setForm({ ...defaultState, ...initial });
	}, [initial]);

	useEffect(() => {
		const load = async () => {
			try {
				const [usersRes, sourcesRes, tagsRes] = await Promise.all([
					userService.getUsers(),
					leadSourceService.getLeadSources(),
					tagService.getTags(),
				]);
				setUsers(usersRes.data.users || []);
				setLeadSources(sourcesRes.data.leadSources || []);
				setAllTags(tagsRes.data.tags || []);
			} catch (e) {
				// ignore for now
			}
		};
		load();
	}, []);

	const handleChange = (key: keyof LeadPayload, value: any) => {
		setForm((s) => ({ ...s, [key]: value }));
	};

	const toggleTag = (tagId: number) => {
		setForm((s) => {
			const current = s.tags || [];
			const exists = current.includes(tagId);
			return { ...s, tags: exists ? current.filter((id) => id !== tagId) : [...current, tagId] };
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await onSubmit(form);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			{/* Fields grid: 1 col (mobile), 3 cols (md), 4 cols (lg) */}
			<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
				<div>
					<InputField label="First Name" leftIcon={<UserIcon className="h-4 w-4 text-gray-400" />} value={form.firstName || ""} onChange={(e) => handleChange("firstName", (e.target as HTMLInputElement).value)} required />
				</div>
				<div>
					<InputField label="Last Name" leftIcon={<UserIcon className="h-4 w-4 text-gray-400" />} value={form.lastName || ""} onChange={(e) => handleChange("lastName", (e.target as HTMLInputElement).value)} required />
				</div>
				<div>
					<InputField label="Email" leftIcon={<Mail className="h-4 w-4 text-gray-400" />} type="email" value={form.email || ""} onChange={(e) => handleChange("email", (e.target as HTMLInputElement).value)} required />
				</div>
				<div>
					<InputField label="Phone" leftIcon={<PhoneIcon className="h-4 w-4 text-gray-400" />} value={form.phone || ""} onChange={(e) => handleChange("phone", (e.target as HTMLInputElement).value)} />
				</div>
				<div>
					<InputField label="Company" leftIcon={<BuildingIcon className="h-4 w-4 text-gray-400" />} value={form.company || ""} onChange={(e) => handleChange("company", (e.target as HTMLInputElement).value)} />
				</div>
				<div>
					<InputField label="Position" leftIcon={<BriefcaseIcon className="h-4 w-4 text-gray-400" />} value={form.position || ""} onChange={(e) => handleChange("position", (e.target as HTMLInputElement).value)} />
				</div>
				<div>
					<SelectField label="Source" leftIcon={<ListFilter className="h-4 w-4 text-gray-400" />} value={form.sourceId ?? ""} onChange={(e) => handleChange("sourceId", e.target.value ? Number(e.target.value) : undefined)}>
						<option value="">Select source</option>
						{leadSources.map((s) => (
							<option key={s.id} value={s.id}>{s.name}</option>
						))}
					</SelectField>
				</div>
				<div>
					<SelectField label="Status" leftIcon={<ListFilter className="h-4 w-4 text-gray-400" />} value={form.status || "new"} onChange={(e) => handleChange("status", e.target.value as LeadPayload["status"])}>
						<option value="new">New</option>
						<option value="contacted">Contacted</option>
						<option value="qualified">Qualified</option>
						<option value="proposal">Proposal</option>
						<option value="negotiation">Negotiation</option>
						<option value="closed">Closed</option>
						<option value="lost">Lost</option>
					</SelectField>
				</div>
				<div>
					<SelectField label="Assigned To" leftIcon={<UserCheck className="h-4 w-4 text-gray-400" />} value={form.assignedTo ?? ""} onChange={(e) => handleChange("assignedTo", e.target.value ? Number(e.target.value) : undefined)}>
						<option value="">Select user</option>
						{users.map((u) => (
							<option key={u.id} value={u.id}>
								{u.firstName} {u.lastName}
							</option>
						))}
					</SelectField>
				</div>
			</div>

			{/* Notes */}
			<TextAreaField label="Notes" value={form.notes || ""} onChange={(e) => handleChange("notes", (e.target as HTMLTextAreaElement).value)} />

			{/* Tags as pills */}
			<div>
				<label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
				<div className="flex flex-wrap gap-2">
					{allTags.map((tag) => {
						const selected = (form.tags || []).includes(tag.id);
						return (
							<button
								key={tag.id}
								type="button"
								onClick={() => toggleTag(tag.id)}
								className={`px-3 py-1 text-xs rounded-full border transition-colors ${
									selected
										? "bg-rose-500 text-white border-rose-500 hover:bg-rose-600"
									: "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
								}`}
							>
								{tag.name}
							</button>
						);
					})}
				</div>
			</div>

			<div className="flex justify-end">
				<button
					type="submit"
					disabled={submitting}
					className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
				>
					{submitting ? "Saving..." : "Save Lead"}
				</button>
			</div>
		</form>
	);
};

export default LeadForm;


