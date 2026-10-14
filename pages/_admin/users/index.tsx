import React, { useState } from 'react';
import type { NextPage } from 'next';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { MemberPanelList } from '../../../libs/components/admin/users/MemberList';
import { AdminPageHeader, AdminPager, AdminSearch, AdminSelect, AdminStats, AdminTabs, useAdminTotal } from '../../../libs/components/admin/AdminUI';
import { MembersInquiry } from '../../../libs/types/member/member.input';
import { Member } from '../../../libs/types/member/member';
import { MemberUpdate } from '../../../libs/types/member/member.update';
import { MemberStatus, MemberType } from '../../../libs/enums/member.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { sweetErrorHandling } from '../../../libs/sweetAlert';
import { UPDATE_MEMBER_BY_ADMIN } from '../../../apollo/admin/mutation';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/admin/query';

const ROOT = 'getAllMembersByAdmin';
const TYPE_OPTIONS = [
	{ value: 'ALL', label: 'All member types' },
	{ value: MemberType.USER, label: 'Customers' },
	{ value: MemberType.AGENT, label: 'Stores' },
	{ value: MemberType.ADMIN, label: 'Admins' },
];

const AdminUsers: NextPage = () => {
	const client = useApolloClient();
	const [inquiry, setInquiry] = useState<MembersInquiry>({ page: 1, limit: 10, sort: 'createdAt', direction: Direction.DESC, search: {} });
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [updateMemberByAdmin] = useMutation(UPDATE_MEMBER_BY_ADMIN);
	const { data } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'cache-and-network',
		variables: { input: inquiry },
	});
	const members: Member[] = data?.[ROOT]?.list ?? [];
	const total: number = data?.[ROOT]?.metaCounter?.[0]?.total ?? 0;

	const totals = {
		all: useAdminTotal(GET_ALL_MEMBERS_BY_ADMIN, ROOT, {}),
		stores: useAdminTotal(GET_ALL_MEMBERS_BY_ADMIN, ROOT, { memberType: MemberType.AGENT }),
		active: useAdminTotal(GET_ALL_MEMBERS_BY_ADMIN, ROOT, { memberStatus: MemberStatus.ACTIVE }),
		block: useAdminTotal(GET_ALL_MEMBERS_BY_ADMIN, ROOT, { memberStatus: MemberStatus.BLOCK }),
		delete: useAdminTotal(GET_ALL_MEMBERS_BY_ADMIN, ROOT, { memberStatus: MemberStatus.DELETE }),
	};

	/** HANDLERS **/
	// Every filter change starts again from page 1
	const setSearch = (patch: Partial<MembersInquiry['search']>) => {
		const search = { ...inquiry.search, ...patch };
		(Object.keys(search) as (keyof typeof search)[]).forEach((key) => !search[key] && delete search[key]);
		setInquiry({ ...inquiry, page: 1, search });
	};

	const updateMemberHandler = async (input: MemberUpdate) => {
		try {
			await updateMemberByAdmin({ variables: { input } });
			// Refreshes the list and every count on the page
			await client.refetchQueries({ include: [GET_ALL_MEMBERS_BY_ADMIN] });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	return (
		<>
			<AdminPageHeader
				title={'Member List'}
				tag={`${totals.all} members`}
				desc={'Customers, stores and admins on Navano. Change a member type or status from its pill in the table.'}
			/>

			<AdminStats
				items={[
					{ label: 'Total members', value: totals.all, note: 'Every account on Navano', icon: <GroupOutlinedIcon /> },
					{ label: 'Stores', value: totals.stores, note: 'Florists, bakers and chocolatiers', icon: <StorefrontOutlinedIcon />, tone: 'info' },
					{ label: 'Active', value: totals.active, note: 'Can sign in and use the site', icon: <TaskAltOutlinedIcon />, tone: 'success' },
					{ label: 'Blocked', value: totals.block, note: 'Signed out of every page', icon: <BlockOutlinedIcon />, tone: 'danger' },
				]}
			/>

			<AdminTabs
				value={inquiry.search.memberStatus ?? 'ALL'}
				onChange={(value) => setSearch({ memberStatus: value === 'ALL' ? undefined : (value as MemberStatus) })}
				tabs={[
					{ value: 'ALL', label: 'All', count: totals.all },
					{ value: MemberStatus.ACTIVE, label: 'Active', count: totals.active },
					{ value: MemberStatus.BLOCK, label: 'Blocked', count: totals.block },
					{ value: MemberStatus.DELETE, label: 'Deleted', count: totals.delete },
				]}
			/>

			<div className={'admin-filters'}>
				<AdminSelect
					label={'Member type'}
					value={inquiry.search.memberType ?? 'ALL'}
					options={TYPE_OPTIONS}
					onChange={(value) => setSearch({ memberType: value === 'ALL' ? undefined : (value as MemberType) })}
				/>
				<AdminSearch
					value={searchText}
					placeholder={'Search by nickname'}
					onChange={setSearchText}
					onSubmit={() => setSearch({ text: searchText.trim() || undefined })}
					onClear={() => {
						setSearchText('');
						setSearch({ text: undefined });
					}}
				/>
			</div>

			<div className={'admin-table-card'}>
				<MemberPanelList members={members} updateMemberHandler={updateMemberHandler} />
				<AdminPager
					total={total}
					page={inquiry.page}
					limit={inquiry.limit}
					onPage={(page) => setInquiry({ ...inquiry, page })}
					onLimit={(limit) => setInquiry({ ...inquiry, page: 1, limit })}
				/>
			</div>
		</>
	);
};

export default withAdminLayout(AdminUsers);
