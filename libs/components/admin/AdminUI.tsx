import React from 'react';
import { DocumentNode, useQuery } from '@apollo/client';
import { Fade, Menu, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

/** Shared building blocks of the admin pages (styles: scss/pc/admin/admin.scss, all under #admin-shell) */

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

// Total of a filtered admin list: asks the API for one row and reads metaCounter
export const useAdminTotal = (query: DocumentNode, root: string, search: object) => {
	const { data } = useQuery(query, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 1, sort: 'createdAt', search } },
	});
	return (data?.[root]?.metaCounter?.[0]?.total as number) ?? 0;
};

export const AdminPageHeader = (props: { title: string; desc: string; tag?: string; actions?: React.ReactNode }) => (
	<header className={'admin-page-head'}>
		<div>
			<div className={'head-title'}>
				<h1>{props.title}</h1>
				{props.tag && <span className={'head-tag'}>{props.tag}</span>}
			</div>
			<p>{props.desc}</p>
		</div>
		{props.actions && <div className={'head-actions'}>{props.actions}</div>}
	</header>
);

export interface StatItem {
	label: string;
	value: number | string;
	note: string;
	icon: React.ReactNode;
	tone?: Tone;
}

export const AdminStats = ({ items }: { items: StatItem[] }) => (
	<section className={'admin-stats'}>
		{items.map((item) => (
			<article key={item.label} className={`stat-card tone-${item.tone ?? 'neutral'}`}>
				<div className={'stat-top'}>
					<span>{item.label}</span>
					{item.icon}
				</div>
				<strong>{item.value}</strong>
				<p>{item.note}</p>
			</article>
		))}
	</section>
);

export interface TabItem {
	value: string;
	label: string;
	count?: number;
}

export const AdminTabs = (props: { tabs: TabItem[]; value: string; onChange: (value: string) => void; aside?: React.ReactNode }) => (
	<div className={'admin-tabs'}>
		<div role={'tablist'}>
			{props.tabs.map((tab) => {
				const active = tab.value === props.value;
				return (
					<button
						type="button"
						role={'tab'}
						key={tab.value}
						aria-selected={active}
						className={active ? 'active' : ''}
						onClick={() => props.onChange(tab.value)}
					>
						{tab.label}
						{tab.count !== undefined && <span className={'tab-count'}>{tab.count}</span>}
					</button>
				);
			})}
		</div>
		{props.aside}
	</div>
);

export const AdminSelect = (props: {
	value: string;
	options: { value: string; label: string }[];
	onChange: (value: string) => void;
	label: string;
}) => (
	<label className={'admin-select'}>
		<span className={'sr-only'}>{props.label}</span>
		<select value={props.value} onChange={(e) => props.onChange(e.target.value)}>
			{props.options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
		<UnfoldMoreIcon aria-hidden />
	</label>
);

export const AdminSearch = (props: {
	value: string;
	placeholder: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	onClear: () => void;
}) => (
	<form
		className={'admin-search'}
		role={'search'}
		onSubmit={(e) => {
			e.preventDefault();
			props.onSubmit();
		}}
	>
		<input
			type="text"
			value={props.value}
			placeholder={props.placeholder}
			aria-label={props.placeholder}
			onChange={(e) => props.onChange(e.target.value)}
		/>
		{props.value && (
			<button type="button" aria-label={'Clear search'} onClick={props.onClear}>
				<CancelOutlinedIcon />
			</button>
		)}
		<button type="submit" aria-label={'Search'} className={'search-go'}>
			<SearchIcon />
		</button>
	</form>
);

export const AdminPager = (props: {
	total: number;
	page: number;
	limit: number;
	onPage: (page: number) => void;
	onLimit: (limit: number) => void;
}) => {
	const pages = Math.max(1, Math.ceil(props.total / props.limit));
	const from = props.total ? (props.page - 1) * props.limit + 1 : 0;
	const to = Math.min(props.total, props.page * props.limit);
	return (
		<footer className={'admin-pager'}>
			<label>
				Rows per page:
				<select value={props.limit} onChange={(e) => props.onLimit(Number(e.target.value))}>
					{[5, 10, 20, 40].map((size) => (
						<option key={size} value={size}>
							{size}
						</option>
					))}
				</select>
			</label>
			<span className={'pager-range'}>
				{from}–{to} of {props.total}
			</span>
			<div className={'pager-nav'}>
				<button type="button" aria-label={'Previous page'} disabled={props.page <= 1} onClick={() => props.onPage(props.page - 1)}>
					<ChevronLeftIcon />
				</button>
				<button type="button" aria-label={'Next page'} disabled={props.page >= pages} onClick={() => props.onPage(props.page + 1)}>
					<ChevronRightIcon />
				</button>
			</div>
		</footer>
	);
};

export const StatusPill = ({ label, tone }: { label: string; tone: Tone }) => (
	<span className={`status-pill tone-${tone}`}>
		<span className={'dot'} aria-hidden />
		{label}
	</span>
);

// A pill that opens a menu of the other values (member type, member / product / article status)
export const StatusMenu = (props: {
	label: string;
	tone: Tone;
	options: { value: string; label: string }[];
	onSelect: (value: string) => void;
}) => {
	const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
	return (
		<>
			<button type="button" className={`status-pill tone-${props.tone} is-button`} onClick={(e) => setAnchor(e.currentTarget)}>
				<span className={'dot'} aria-hidden />
				{props.label}
				<ExpandMoreIcon aria-hidden />
			</button>
			<Menu
				anchorEl={anchor}
				open={Boolean(anchor)}
				onClose={() => setAnchor(null)}
				TransitionComponent={Fade}
				PaperProps={{ className: 'admin-menu-paper' }}
			>
				{props.options.map((option) => (
					<MenuItem
						key={option.value}
						onClick={() => {
							setAnchor(null);
							props.onSelect(option.value);
						}}
					>
						{option.label}
					</MenuItem>
				))}
			</Menu>
		</>
	);
};

export const EmptyRow = ({ colSpan, text }: { colSpan: number; text: string }) => (
	<tr>
		<td colSpan={colSpan} className={'table-empty'}>
			{text}
		</td>
	</tr>
);

export const shortId = (id?: string) => (id ? `#${id.slice(-6).toUpperCase()}` : '');

export const toLabel = (value?: string) => (value ? value.charAt(0) + value.slice(1).toLowerCase() : '');
