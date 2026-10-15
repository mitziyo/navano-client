import React, { useState } from 'react';
import Link from 'next/link';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import { userVar } from '../../../apollo/store';
import { GET_MY_INQUIRIES } from '../../../apollo/user/query';
import { CREATE_INQUIRY, REMOVE_INQUIRY } from '../../../apollo/user/mutation';
import { Inquiries, InquiryInput } from '../../types/inquiry/inquiry';
import { InquiryStatus, InquiryType } from '../../enums/inquiry.enum';
import { sweetConfirmAlert, sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';
import { INQUIRY_TYPES } from './csContent';

const TITLE_MIN = 3;
const TITLE_MAX = 100;
const CONTENT_MIN = 10;
const CONTENT_MAX = 2000;

const emptyForm: InquiryInput = { inquiryType: InquiryType.ORDER, inquiryTitle: '', inquiryContent: '' };

// 1:1 inquiry: members send a private question and see the Navano team's answer here
const Inquiry = () => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [form, setForm] = useState<InquiryInput>(emptyForm);

	/** APOLLO REQUESTS **/
	const { data, loading, refetch } = useQuery<{ getMyInquiries: Inquiries }>(GET_MY_INQUIRIES, {
		variables: { input: { page: 1, limit: 50 } },
		skip: !user?._id,
		fetchPolicy: 'cache-and-network',
	});
	const [createInquiry, { loading: sending }] = useMutation(CREATE_INQUIRY);
	const [removeInquiry] = useMutation(REMOVE_INQUIRY);
	const inquiries = data?.getMyInquiries?.list ?? [];

	const title = form.inquiryTitle.trim();
	const content = form.inquiryContent.trim();
	const valid =
		title.length >= TITLE_MIN &&
		title.length <= TITLE_MAX &&
		content.length >= CONTENT_MIN &&
		content.length <= CONTENT_MAX;

	/** HANDLERS **/
	const submitHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!valid || sending) return;
		try {
			await createInquiry({ variables: { input: { ...form, inquiryTitle: title, inquiryContent: content } } });
			setForm(emptyForm);
			await refetch();
			await sweetMixinSuccessAlert(t('Your question was sent'));
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const withdrawHandler = async (id: string) => {
		try {
			if (!(await sweetConfirmAlert(t('Withdraw this question?')))) return;
			await removeInquiry({ variables: { input: id } });
			await refetch();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	return (
		<section className={'cs-panel'} id={'inquiry-section'} aria-label={t('One-to-one inquiry')}>
			<header className={'panel-head'}>
				<div className={'panel-title'}>
					<span className={'panel-chip'}>
						<span className={'dot'} aria-hidden />
						{t('One-to-one inquiry')}
					</span>
					<span className={'panel-meta'}>{t('The Navano team usually answers within one business day')}</span>
				</div>
			</header>

			{!user?._id ? (
				<div className={'inquiry-locked'}>
					<span className={'locked-icon'} aria-hidden>
						<LockOutlinedIcon />
					</span>
					<strong>{t('Log in to send a question')}</strong>
					<p>{t('Your questions and our answers are private and stay in your account.')}</p>
					<Link href={'/account/join'} className={'cs-btn primary'}>
						{t('Login')} / {t('Register')}
					</Link>
				</div>
			) : (
				<div className={'inquiry-grid'}>
					<form className={'inquiry-form'} onSubmit={submitHandler} noValidate>
						<label>
							<span>{t('Topic')}</span>
							<select
								value={form.inquiryType}
								onChange={(e) => setForm({ ...form, inquiryType: e.target.value as InquiryType })}
							>
								{INQUIRY_TYPES.map((item) => (
									<option key={item.value} value={item.value}>
										{t(item.label)}
									</option>
								))}
							</select>
						</label>
						<label>
							<span>{t('Title')}</span>
							<input
								type="text"
								value={form.inquiryTitle}
								maxLength={TITLE_MAX}
								placeholder={t('e.g. My cake has not arrived')}
								onChange={(e) => setForm({ ...form, inquiryTitle: e.target.value })}
							/>
						</label>
						<label>
							<span>
								{t('Question')}
								<small>
									{content.length}/{CONTENT_MAX}
								</small>
							</span>
							<textarea
								rows={6}
								value={form.inquiryContent}
								maxLength={CONTENT_MAX}
								placeholder={t('Tell us the store, the product and what happened')}
								onChange={(e) => setForm({ ...form, inquiryContent: e.target.value })}
							/>
						</label>
						<p className={'form-hint'}>
							{t('Title')} {TITLE_MIN}–{TITLE_MAX}, {t('question')} {CONTENT_MIN}–{CONTENT_MAX} {t('characters')}
						</p>
						<button type="submit" className={'cs-btn primary block'} disabled={!valid || sending}>
							<SendRoundedIcon aria-hidden />
							{sending ? t('Sending...') : t('Send question')}
						</button>
					</form>

					<div className={'inquiry-list'}>
						<h4>
							{t('My inquiries')} <span>{inquiries.length}</span>
						</h4>
						{inquiries.length === 0 ? (
							<p className={'empty-row'}>{loading ? t('Loading...') : t('You have not asked anything yet')}</p>
						) : (
							inquiries.map((item) => {
								const answered = item.inquiryStatus === InquiryStatus.ANSWERED;
								return (
									<article key={item._id} className={`inquiry-item ${answered ? 'is-answered' : ''}`}>
										<div className={'inquiry-meta'}>
											<span className={'notice-tag'}>
												{t(INQUIRY_TYPES.find((type) => type.value === item.inquiryType)?.label ?? 'Other')}
											</span>
											<span className={`inquiry-status ${answered ? 'answered' : 'waiting'}`}>
												{answered ? t('Answered') : t('Waiting')}
											</span>
											<time dateTime={moment(item.createdAt).toISOString()}>
												{moment(item.createdAt).format('DD.MM.YYYY HH:mm')}
											</time>
										</div>
										<strong>{item.inquiryTitle}</strong>
										<p>{item.inquiryContent}</p>
										{answered && item.inquiryAnswer ? (
											<div className={'inquiry-answer'}>
												<span className={'answer-head'}>
													<SupportAgentOutlinedIcon aria-hidden />
													{t('Navano team')}
													{item.answeredAt && <time>{moment(item.answeredAt).format('DD.MM.YYYY')}</time>}
												</span>
												<p>{item.inquiryAnswer}</p>
											</div>
										) : (
											<button type="button" className={'inquiry-withdraw'} onClick={() => withdrawHandler(item._id)}>
												{t('Withdraw')}
											</button>
										)}
									</article>
								);
							})
						)}
					</div>
				</div>
			)}
		</section>
	);
};

export default Inquiry;
