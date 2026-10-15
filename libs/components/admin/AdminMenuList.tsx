import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface NavGroup {
	key: string;
	title: string;
	icon: React.ReactNode;
	links: { title: string; url: string }[];
}

const NAV: NavGroup[] = [
	{ key: 'dashboard', title: 'Dashboard', icon: <SpaceDashboardOutlinedIcon />, links: [{ title: 'Overview', url: '/_admin' }] },
	{ key: 'users', title: 'Users', icon: <BadgeOutlinedIcon />, links: [{ title: 'Member List', url: '/_admin/users' }] },
	{ key: 'products', title: 'Products', icon: <Inventory2OutlinedIcon />, links: [{ title: 'Product List', url: '/_admin/products' }] },
	{ key: 'community', title: 'Community', icon: <ForumOutlinedIcon />, links: [{ title: 'Article List', url: '/_admin/community' }] },
	{
		key: 'cs',
		title: 'Customer Service',
		icon: <SupportAgentOutlinedIcon />,
		links: [
			{ title: 'FAQ Management', url: '/_admin/cs/faq' },
			{ title: 'Notice Management', url: '/_admin/cs/notice' },
			{ title: '1:1 Inquiry', url: '/_admin/cs/inquiry' },
		],
	},
];

const AdminMenuList = () => {
	const router = useRouter();
	// The group of the current page starts open; others open on click
	const current = NAV.find((group) => group.links.some((link) => link.url === router.pathname))?.key ?? 'dashboard';
	const [open, setOpen] = useState<string[]>([current]);

	const toggle = (key: string) => setOpen((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));

	return (
		<nav className={'aside-nav'} aria-label={'Admin sections'}>
			{NAV.map((group) => {
				const expanded = open.includes(group.key);
				return (
					<div key={group.key} className={`nav-group ${group.key === current ? 'is-current' : ''}`}>
						<button type="button" className={'nav-head'} aria-expanded={expanded} onClick={() => toggle(group.key)}>
							<span className={'nav-head-label'}>
								{group.icon}
								{group.title}
							</span>
							<ExpandMoreIcon className={`chevron ${expanded ? 'up' : ''}`} aria-hidden />
						</button>
						{expanded && (
							<div className={'nav-links'}>
								{group.links.map((link) => {
									const active = link.url === router.pathname;
									return (
										<Link
											key={link.url}
											href={link.url}
											className={`nav-link ${active ? 'active' : ''}`}
											aria-current={active ? 'page' : undefined}
										>
											{link.title}
										</Link>
									);
								})}
							</div>
						)}
					</div>
				);
			})}
		</nav>
	);
};

export default AdminMenuList;
