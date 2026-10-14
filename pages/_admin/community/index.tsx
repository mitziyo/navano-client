import React, { useState } from 'react';
import type { NextPage } from 'next';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import CommunityArticleList from '../../../libs/components/admin/community/CommunityArticleList';
import { AdminPageHeader, AdminPager, AdminSelect, AdminStats, AdminTabs, useAdminTotal } from '../../../libs/components/admin/AdminUI';
import { BOARDS } from '../../../libs/components/community/boards';
import { AllBoardArticlesInquiry } from '../../../libs/types/board-article/board-article.input';
import { BoardArticle } from '../../../libs/types/board-article/board-article';
import { BoardArticleUpdate } from '../../../libs/types/board-article/board-article.update';
import { BoardArticleCategory, BoardArticleStatus } from '../../../libs/enums/board-article.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { REMOVE_BOARD_ARTICLE_BY_ADMIN, UPDATE_BOARD_ARTICLE_BY_ADMIN } from '../../../apollo/admin/mutation';
import { GET_ALL_BOARD_ARTICLES_BY_ADMIN } from '../../../apollo/admin/query';

const ROOT = 'getAllBoardArticlesByAdmin';
const BOARD_OPTIONS = [{ value: 'ALL', label: 'All boards' }, ...BOARDS.map((board) => ({ value: board.value, label: board.label }))];

const AdminCommunity: NextPage = () => {
	const client = useApolloClient();
	const [inquiry, setInquiry] = useState<AllBoardArticlesInquiry>({ page: 1, limit: 10, sort: 'createdAt', direction: Direction.DESC, search: {} });

	/** APOLLO REQUESTS **/
	const [updateBoardArticleByAdmin] = useMutation(UPDATE_BOARD_ARTICLE_BY_ADMIN);
	const [removeBoardArticleByAdmin] = useMutation(REMOVE_BOARD_ARTICLE_BY_ADMIN);
	const { data } = useQuery(GET_ALL_BOARD_ARTICLES_BY_ADMIN, {
		fetchPolicy: 'cache-and-network',
		variables: { input: inquiry },
	});
	const articles: BoardArticle[] = data?.[ROOT]?.list ?? [];
	const total: number = data?.[ROOT]?.metaCounter?.[0]?.total ?? 0;

	const totals = {
		all: useAdminTotal(GET_ALL_BOARD_ARTICLES_BY_ADMIN, ROOT, {}),
		active: useAdminTotal(GET_ALL_BOARD_ARTICLES_BY_ADMIN, ROOT, { articleStatus: BoardArticleStatus.ACTIVE }),
		delete: useAdminTotal(GET_ALL_BOARD_ARTICLES_BY_ADMIN, ROOT, { articleStatus: BoardArticleStatus.DELETE }),
	};

	/** HANDLERS **/
	const setSearch = (patch: Partial<AllBoardArticlesInquiry['search']>) => {
		const search = { ...inquiry.search, ...patch };
		(Object.keys(search) as (keyof typeof search)[]).forEach((key) => !search[key] && delete search[key]);
		setInquiry({ ...inquiry, page: 1, search });
	};

	const refresh = () => client.refetchQueries({ include: [GET_ALL_BOARD_ARTICLES_BY_ADMIN] });

	const updateArticleHandler = async (input: BoardArticleUpdate) => {
		try {
			await updateBoardArticleByAdmin({ variables: { input } });
			await refresh();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	// The API removes only articles that are already in DELETE status
	const removeArticleHandler = async (id: string) => {
		try {
			if (!(await sweetConfirmAlert('Remove this article for good?'))) return;
			await removeBoardArticleByAdmin({ variables: { input: id } });
			await refresh();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	return (
		<>
			<AdminPageHeader
				title={'Article List'}
				tag={`${totals.all} articles`}
				desc={'Posts on the Free, Recommendation, News and Humor boards. Hide an article by setting it to Delete, then remove it for good.'}
			/>

			<AdminStats
				items={[
					{ label: 'Total articles', value: totals.all, note: 'On every community board', icon: <ArticleOutlinedIcon /> },
					{ label: 'Active', value: totals.active, note: 'Visible on the boards', icon: <TaskAltOutlinedIcon />, tone: 'success' },
					{ label: 'Deleted', value: totals.delete, note: 'Hidden, waiting to be removed', icon: <DeleteSweepOutlinedIcon />, tone: 'danger' },
					{ label: 'Boards', value: BOARDS.length, note: BOARDS.map((board) => board.label).join(' · '), icon: <ForumOutlinedIcon />, tone: 'info' },
				]}
			/>

			<AdminTabs
				value={inquiry.search.articleStatus ?? 'ALL'}
				onChange={(value) => setSearch({ articleStatus: value === 'ALL' ? undefined : (value as BoardArticleStatus) })}
				tabs={[
					{ value: 'ALL', label: 'All', count: totals.all },
					{ value: BoardArticleStatus.ACTIVE, label: 'Active', count: totals.active },
					{ value: BoardArticleStatus.DELETE, label: 'Deleted', count: totals.delete },
				]}
			/>

			<div className={'admin-filters'}>
				<AdminSelect
					label={'Board'}
					value={inquiry.search.articleCategory ?? 'ALL'}
					options={BOARD_OPTIONS}
					onChange={(value) => setSearch({ articleCategory: value === 'ALL' ? undefined : (value as BoardArticleCategory) })}
				/>
			</div>

			<div className={'admin-table-card'}>
				<CommunityArticleList articles={articles} updateArticleHandler={updateArticleHandler} removeArticleHandler={removeArticleHandler} />
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

export default withAdminLayout(AdminCommunity);
