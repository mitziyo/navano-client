import React from 'react';
import Link from 'next/link';
import Moment from 'react-moment';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { BoardArticle } from '../../../types/board-article/board-article';
import { BoardArticleUpdate } from '../../../types/board-article/board-article.update';
import { REACT_APP_API_URL } from '../../../config';
import { BoardArticleStatus } from '../../../enums/board-article.enum';
import { boardLabel } from '../../community/boards';
import { EmptyRow, StatusMenu, StatusPill, shortId } from '../AdminUI';

interface CommunityArticleListProps {
	articles: BoardArticle[];
	updateArticleHandler: (input: BoardArticleUpdate) => void;
	removeArticleHandler: (id: string) => void;
}

const CommunityArticleList = ({ articles, updateArticleHandler, removeArticleHandler }: CommunityArticleListProps) => (
	<div className={'admin-table-scroll'}>
		<table className={'admin-table'}>
			<thead>
				<tr>
					<th>Board &amp; ID</th>
					<th>Title</th>
					<th>Writer</th>
					<th className={'center'}>Views</th>
					<th className={'center'}>Likes</th>
					<th>Posted</th>
					<th className={'center'}>Status</th>
				</tr>
			</thead>
			<tbody>
				{articles.length === 0 && <EmptyRow colSpan={7} text={'No articles match these filters'} />}
				{articles.map((article) => {
					const active = article.articleStatus === BoardArticleStatus.ACTIVE;
					return (
						<tr key={article._id}>
							<td>
								<span className={'cell-stack'}>
									<strong>{boardLabel(article.articleCategory)}</strong>
									<small>{shortId(article._id)}</small>
								</span>
							</td>
							<td className={'wide'}>
								{active ? (
									<Link
										href={`/community/detail?articleCategory=${article.articleCategory}&id=${article._id}`}
										target={'_blank'}
										className={'cell-link with-icon'}
									>
										{article.articleTitle}
										<OpenInNewIcon aria-hidden />
									</Link>
								) : (
									<span className={'muted'}>{article.articleTitle}</span>
								)}
							</td>
							<td>
								<Link href={`/member?memberId=${article.memberData?._id}`} className={'cell-identity'}>
									<img
										src={article.memberData?.memberImage ? `${REACT_APP_API_URL}/${article.memberData.memberImage}` : '/img/profile/defaultUser.svg'}
										alt=""
									/>
									<span>
										<strong>{article.memberData?.memberNick}</strong>
									</span>
								</Link>
							</td>
							<td className={'center mono'}>{article.articleViews}</td>
							<td className={'center mono'}>{article.articleLikes}</td>
							<td className={'mono'}>
								<Moment format={'YYYY.MM.DD HH:mm'}>{article.createdAt}</Moment>
							</td>
							{/* The API changes only ACTIVE articles and removes only DELETE ones */}
							<td className={'center'}>
								{active ? (
									<StatusMenu
										label={'Active'}
										tone={'success'}
										options={[{ value: BoardArticleStatus.DELETE, label: 'Delete' }]}
										onSelect={(status) => updateArticleHandler({ _id: article._id, articleStatus: status as BoardArticleStatus })}
									/>
								) : (
									<span className={'cell-actions'}>
										<StatusPill label={'Deleted'} tone={'neutral'} />
										<button
											type="button"
											className={'icon-btn danger'}
											aria-label={'Remove for good'}
											title={'Remove for good'}
											onClick={() => removeArticleHandler(article._id)}
										>
											<DeleteForeverOutlinedIcon />
										</button>
									</span>
								)}
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	</div>
);

export default CommunityArticleList;
