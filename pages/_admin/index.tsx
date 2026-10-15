import React from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import moment from 'moment';
import { useQuery } from '@apollo/client';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import {
	AdminPageHeader,
	AdminStats,
	EmptyRow,
	StatusPill,
	shortId,
	toLabel,
} from '../../libs/components/admin/AdminUI';
import { GET_ADMIN_STATS, GET_ALL_INQUIRIES_BY_ADMIN } from '../../apollo/admin/query';
import { Inquiry } from '../../libs/types/inquiry/inquiry';
import { InquiryStatus } from '../../libs/enums/inquiry.enum';
import { INQUIRY_TYPES } from '../../libs/components/cs/csContent';
import { REACT_APP_API_URL } from '../../libs/config';

interface StatCount {
	value: string;
	count: number;
}
interface CollectionStats {
	total: number;
	newThisWeek: number;
	byStatus: StatCount[];
	byType: StatCount[];
}
type Stats = Record<'members' | 'products' | 'articles' | 'inquiries' | 'notices', CollectionStats>;

const countOf = (list: StatCount[] | undefined, value: string) =>
	list?.find((item) => item.value === value)?.count ?? 0;

// Labels for enum values that read badly with toLabel()
const LABELS: Record<string, string> = {
	AGENT: 'Stores',
	USER: 'Customers',
	ADMIN: 'Admins',
	HOLD: 'On hold',
	SOLD: 'Sold out',
	RECOMMEND: 'Recommendation',
};
const label = (value: string) => LABELS[value] ?? toLabel(value);

const Breakdown = ({ title, href, items }: { title: string; href: string; items: StatCount[] }) => {
	const total = items.reduce((sum, item) => sum + item.count, 0) || 1;
	return (
		<article className={'dash-card'}>
			<header>
				<h3>{title}</h3>
				<Link href={href} className={'dash-link'}>
					Open
					<ArrowForwardRoundedIcon aria-hidden />
				</Link>
			</header>
			{items.length === 0 ? (
				<p className={'dash-empty'}>No data yet</p>
			) : (
				<ul className={'dash-bars'}>
					{items.map((item) => (
						<li key={item.value}>
							<span className={'bar-label'}>{label(item.value)}</span>
							<span className={'bar-track'} aria-hidden>
								<span className={'bar-fill'} style={{ width: `${Math.round((item.count / total) * 100)}%` }} />
							</span>
							<span className={'bar-value'}>{item.count}</span>
						</li>
					))}
				</ul>
			)}
		</article>
	);
};

// Admin home: totals, how they split, and the questions that still need an answer
const AdminHome: NextPage = () => {
	const { data } = useQuery<{ getAdminStats: Stats }>(GET_ADMIN_STATS, { fetchPolicy: 'cache-and-network' });
	const waiting = useQuery(GET_ALL_INQUIRIES_BY_ADMIN, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 5, search: { inquiryStatus: InquiryStatus.WAIT } } },
	});
	const stats = data?.getAdminStats;
	const inquiries: Inquiry[] = waiting.data?.getAllInquiriesByAdmin?.list ?? [];
	const waitingCount = countOf(stats?.inquiries.byStatus, InquiryStatus.WAIT);
	const typeLabel = (value: string) => INQUIRY_TYPES.find((item) => item.value === value)?.label ?? value;

	return (
		<>
			<AdminPageHeader
				title={'Dashboard'}
				tag={moment().format('YYYY.MM.DD')}
				desc={'A quick look at members, products, community posts and customer questions on Navano.'}
			/>

			<AdminStats
				items={[
					{
						label: 'Members',
						value: stats?.members.total ?? '—',
						note: `${countOf(stats?.members.byType, 'AGENT')} stores · +${stats?.members.newThisWeek ?? 0} this week`,
						icon: <BadgeOutlinedIcon />,
					},
					{
						label: 'Products',
						value: stats?.products.total ?? '—',
						note: `${countOf(stats?.products.byStatus, 'ACTIVE')} active · +${
							stats?.products.newThisWeek ?? 0
						} this week`,
						icon: <Inventory2OutlinedIcon />,
						tone: 'success',
					},
					{
						label: 'Articles',
						value: stats?.articles.total ?? '—',
						note: `+${stats?.articles.newThisWeek ?? 0} this week`,
						icon: <ForumOutlinedIcon />,
						tone: 'info',
					},
					{
						label: 'Waiting inquiries',
						value: stats ? waitingCount : '—',
						note: `${stats?.inquiries.total ?? 0} inquiries in total`,
						icon: <MarkEmailUnreadOutlinedIcon />,
						tone: waitingCount ? 'warning' : 'neutral',
					},
				]}
			/>

			<section className={'dash-grid'}>
				<Breakdown title={'Members by role'} href={'/_admin/users'} items={stats?.members.byType ?? []} />
				<Breakdown title={'Products by category'} href={'/_admin/products'} items={stats?.products.byType ?? []} />
				<Breakdown title={'Products by status'} href={'/_admin/products'} items={stats?.products.byStatus ?? []} />
				<Breakdown title={'Articles by board'} href={'/_admin/community'} items={stats?.articles.byType ?? []} />
			</section>

			<div className={'admin-table-card'}>
				<header className={'dash-table-head'}>
					<h3>Questions waiting for an answer</h3>
					<Link href={'/_admin/cs/inquiry'} className={'dash-link'}>
						Open the inbox
						<ArrowForwardRoundedIcon aria-hidden />
					</Link>
				</header>
				<div className={'admin-table-scroll'}>
					<table className={'admin-table'}>
						<thead>
							<tr>
								<th>Member</th>
								<th>Topic</th>
								<th>Question</th>
								<th>Sent</th>
								<th className={'center'}>Status</th>
							</tr>
						</thead>
						<tbody>
							{inquiries.length === 0 && <EmptyRow colSpan={5} text={'Every question has an answer'} />}
							{inquiries.map((row) => (
								<tr key={row._id}>
									<td>
										<span className={'cell-identity'}>
											<img
												src={
													row.memberData?.memberImage
														? `${REACT_APP_API_URL}/${row.memberData.memberImage}`
														: '/img/profile/defaultUser.svg'
												}
												alt=""
											/>
											<span>
												<strong>{row.memberData?.memberNick ?? 'Unknown'}</strong>
												<small>{shortId(row.memberId)}</small>
											</span>
										</span>
									</td>
									<td>{typeLabel(row.inquiryType)}</td>
									<td className={'wide'}>
										<span className={'cell-stack'}>
											<strong>{row.inquiryTitle}</strong>
											<small className={'clamp'}>{row.inquiryContent}</small>
										</span>
									</td>
									<td className={'mono'}>{moment(row.createdAt).fromNow()}</td>
									<td className={'center'}>
										<StatusPill label={'Waiting'} tone={'warning'} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
};

export default withAdminLayout(AdminHome);
