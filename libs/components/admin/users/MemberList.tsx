import React from 'react';
import Link from 'next/link';
import Moment from 'react-moment';
import { Member } from '../../../types/member/member';
import { MemberUpdate } from '../../../types/member/member.update';
import { REACT_APP_API_URL } from '../../../config';
import { MemberStatus, MemberType } from '../../../enums/member.enum';
import { EmptyRow, StatusMenu, Tone, shortId } from '../AdminUI';

const TYPE_LABEL: Record<string, string> = { [MemberType.USER]: 'Customer', [MemberType.AGENT]: 'Store', [MemberType.ADMIN]: 'Admin' };
const TYPE_TONE: Record<string, Tone> = { [MemberType.USER]: 'neutral', [MemberType.AGENT]: 'info', [MemberType.ADMIN]: 'warning' };
const STATUS_TONE: Record<string, Tone> = { [MemberStatus.ACTIVE]: 'success', [MemberStatus.BLOCK]: 'danger', [MemberStatus.DELETE]: 'neutral' };

// Public page of a member: stores have their own directory page
const memberHref = (member: Member) =>
	member.memberType === MemberType.AGENT ? `/agent/detail?agentId=${member._id}` : `/member?memberId=${member._id}`;

interface MemberPanelListType {
	members: Member[];
	updateMemberHandler: (input: MemberUpdate) => void;
}

export const MemberPanelList = ({ members, updateMemberHandler }: MemberPanelListType) => (
	<div className={'admin-table-scroll'}>
		<table className={'admin-table'}>
			<thead>
				<tr>
					<th>Member</th>
					<th>Full name</th>
					<th>Phone</th>
					<th className={'center'}>Products</th>
					<th className={'center'}>Warnings</th>
					<th className={'center'}>Blocks</th>
					<th>Joined</th>
					<th className={'center'}>Type</th>
					<th className={'center'}>Status</th>
				</tr>
			</thead>
			<tbody>
				{members.length === 0 && <EmptyRow colSpan={9} text={'No members match these filters'} />}
				{members.map((member) => (
					<tr key={member._id}>
						<td>
							<Link href={memberHref(member)} className={'cell-identity'}>
								<img src={member.memberImage ? `${REACT_APP_API_URL}/${member.memberImage}` : '/img/profile/defaultUser.svg'} alt="" />
								<span>
									<strong>{member.memberNick}</strong>
									<small>{shortId(member._id)}</small>
								</span>
							</Link>
						</td>
						<td>{member.memberFullName || '—'}</td>
						<td className={'mono'}>{member.memberPhone}</td>
						<td className={'center mono'}>{member.memberProducts ?? 0}</td>
						<td className={'center mono'}>{member.memberWarnings ?? 0}</td>
						<td className={'center mono'}>{member.memberBlocks ?? 0}</td>
						<td className={'mono'}>
							<Moment format={'YYYY.MM.DD'}>{member.createdAt}</Moment>
						</td>
						<td className={'center'}>
							<StatusMenu
								label={TYPE_LABEL[member.memberType] ?? member.memberType}
								tone={TYPE_TONE[member.memberType] ?? 'neutral'}
								options={Object.values(MemberType)
									.filter((type) => type !== member.memberType)
									.map((type) => ({ value: type, label: TYPE_LABEL[type] }))}
								onSelect={(type) => updateMemberHandler({ _id: member._id, memberType: type as MemberType })}
							/>
						</td>
						<td className={'center'}>
							<StatusMenu
								label={member.memberStatus}
								tone={STATUS_TONE[member.memberStatus] ?? 'neutral'}
								options={Object.values(MemberStatus)
									.filter((status) => status !== member.memberStatus)
									.map((status) => ({ value: status, label: status }))}
								onSelect={(status) => updateMemberHandler({ _id: member._id, memberStatus: status as MemberStatus })}
							/>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	</div>
);
