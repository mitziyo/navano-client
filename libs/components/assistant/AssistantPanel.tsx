import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useMutation, useReactiveVar } from '@apollo/client';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { assistantOpenVar, userVar } from '../../../apollo/store';
import { ASK_ASSISTANT } from '../../../apollo/user/mutation';
import { AssistantMessage, AssistantProduct, AssistantReply } from '../../types/assistant/assistant';
import { REACT_APP_API_URL } from '../../config';
import { formatterStr } from '../../utils';
import { toLabel } from '../homepage/productLabels';

const STORAGE_KEY = 'navano-ai-chat';
const MAX_TURNS = 12; // same as the backend limit
const MAX_LENGTH = 1000;

const SUGGESTIONS = [
	'Birthday flowers in Seoul',
	'Cakes under $50',
	'A chocolate gift for an anniversary',
	'Which stores sell cakes in Busan?',
];

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// The model is asked for plain text; drop stray markdown emphasis if it slips through
const cleanText = (text: string) => text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/^#+\s*/gm, '');

const loadChat = (memberId: string): AssistantMessage[] => {
	try {
		const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null');
		return saved?.memberId === memberId && Array.isArray(saved.messages) ? saved.messages : [];
	} catch {
		return [];
	}
};

const ProductChip = ({ product, onOpen }: { product: AssistantProduct; onOpen: () => void }) => {
	const image = product.productImages?.[0] ? `${REACT_APP_API_URL}/${product.productImages[0]}` : '/img/banner/header1.svg';
	return (
		<Link
			href={{ pathname: '/product/detail', query: { id: product._id } }}
			className={'ai-product'}
			onClick={onOpen}
		>
			<img src={image} alt="" loading="lazy" />
			<span className={'ai-product-body'}>
				<strong>{product.productTitle}</strong>
				<small>
					{toLabel(product.productType)} · {toLabel(product.productLocation)}
				</small>
			</span>
			<span className={'ai-product-price'}>${formatterStr(product.productPrice)}</span>
		</Link>
	);
};

const AssistantPanel = () => {
	const { t } = useTranslation('common');
	const open = useReactiveVar(assistantOpenVar);
	const user = useReactiveVar(userVar);
	const [messages, setMessages] = useState<AssistantMessage[]>([]);
	const [draft, setDraft] = useState('');
	const [askAssistant, { loading }] = useMutation<{ askAssistant: AssistantReply }>(ASK_ASSISTANT);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const loggedIn = Boolean(user?._id);

	/** LIFECYCLES **/
	// The chat lives for the browser tab and belongs to the logged-in member
	useEffect(() => {
		setMessages(user?._id ? loadChat(user._id) : []);
	}, [user?._id]);

	useEffect(() => {
		if (!user?._id) return;
		try {
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ memberId: user._id, messages }));
		} catch {
			// storage full or blocked: the chat still works for this page
		}
	}, [messages, user?._id]);

	useEffect(() => {
		if (open && loggedIn) inputRef.current?.focus();
	}, [open, loggedIn]);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') assistantOpenVar(false);
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [open]);

	useEffect(() => {
		listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
	}, [messages, loading, open]);

	/** HANDLERS **/
	const send = async (value: string) => {
		const text = value.trim().slice(0, MAX_LENGTH);
		if (!text || loading) return;

		const userMessage: AssistantMessage = { id: newId(), role: 'user', text };
		const history = [...messages, userMessage];
		setMessages(history);
		setDraft('');

		const turns = history
			.filter((message) => !message.error)
			.slice(-MAX_TURNS)
			.map(({ role, text: turnText }) => ({ role, text: turnText.slice(0, MAX_LENGTH) }));

		try {
			const { data } = await askAssistant({ variables: { input: { messages: turns } } });
			const reply = data?.askAssistant;
			setMessages((prev) => [
				...prev,
				{
					id: newId(),
					role: 'assistant',
					text: cleanText(reply?.text ?? ''),
					products: reply?.products ?? [],
				},
			]);
		} catch (err: any) {
			setMessages((prev) => [
				...prev,
				{
					id: newId(),
					role: 'assistant',
					text: err?.graphQLErrors?.[0]?.message ?? t('Navano AI could not answer. Please try again.'),
					error: true,
				},
			]);
		}
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
			e.preventDefault();
			send(draft);
		}
	};

	const newChat = () => {
		setMessages([]);
		setDraft('');
		inputRef.current?.focus();
	};

	// Stays mounted so it can slide in and out like the chat frame
	return (
		<section
			id="navano-ai-panel"
			className={`ai-panel ${open ? 'open' : ''}`}
			role="dialog"
			aria-label={t('Navano AI')}
			aria-hidden={!open}
		>
			<header className={'ai-head'}>
				<span className={'ai-mark'} aria-hidden>
					<AutoAwesomeIcon />
				</span>
				<div className={'ai-title'}>
					<strong>{t('Navano AI')}</strong>
					<small>{t('Your gift assistant')}</small>
				</div>
				{loggedIn && (
					<button type="button" className={'ai-icon-btn'} onClick={newChat} aria-label={t('New chat')} title={t('New chat')}>
						<EditNoteOutlinedIcon />
					</button>
				)}
				<button
					type="button"
					className={'ai-icon-btn'}
					onClick={() => assistantOpenVar(false)}
					aria-label={t('Close')}
					title={t('Close')}
				>
					<ExpandMoreIcon />
				</button>
			</header>

			{!loggedIn ? (
				<div className={'ai-locked'}>
					<span className={'ai-locked-icon'} aria-hidden>
						<LockOutlinedIcon />
					</span>
					<strong>{t('Log in to chat with Navano AI')}</strong>
					<p>{t('Navano AI finds flowers, chocolates and cakes from our stores for any occasion.')}</p>
					<Link href={'/account/join'} className={'ai-primary-btn'} onClick={() => assistantOpenVar(false)}>
						{t('Login')} / {t('Register')}
					</Link>
				</div>
			) : (
				<>
					<div className={'ai-list'} ref={listRef} aria-live="polite">
						{messages.length === 0 && (
							<div className={'ai-welcome'}>
								<strong>
									{t('Hi')}, {user.memberFullName || user.memberNick}!
								</strong>
								<p>{t('Tell me who the gift is for, the occasion and your budget. I will find matching products.')}</p>
								<div className={'ai-suggestions'}>
									{SUGGESTIONS.map((suggestion) => (
										<button type="button" key={suggestion} onClick={() => send(t(suggestion))}>
											{t(suggestion)}
										</button>
									))}
								</div>
							</div>
						)}

						{messages.map((message) =>
							message.role === 'user' ? (
								<div key={message.id} className={'ai-row is-user'}>
									<p className={'ai-bubble'}>{message.text}</p>
								</div>
							) : (
								<div key={message.id} className={`ai-row is-bot ${message.error ? 'is-error' : ''}`}>
									<span className={'ai-avatar'} aria-hidden>
										<AutoAwesomeIcon />
									</span>
									<div className={'ai-bot-body'}>
										<p className={'ai-bubble'}>{message.text}</p>
										{message.products && message.products.length > 0 && (
											<div className={'ai-products'}>
												{message.products.map((product) => (
													<ProductChip key={product._id} product={product} onOpen={() => assistantOpenVar(false)} />
												))}
											</div>
										)}
									</div>
								</div>
							),
						)}

						{loading && (
							<div className={'ai-row is-bot'}>
								<span className={'ai-avatar'} aria-hidden>
									<AutoAwesomeIcon />
								</span>
								<p className={'ai-bubble ai-typing'} aria-label={t('Navano AI is typing')}>
									<span />
									<span />
									<span />
								</p>
							</div>
						)}
					</div>

					<form
						className={'ai-form'}
						onSubmit={(e) => {
							e.preventDefault();
							send(draft);
						}}
					>
						<textarea
							ref={inputRef}
							rows={1}
							value={draft}
							maxLength={MAX_LENGTH}
							placeholder={t('Message Navano AI...')}
							aria-label={t('Message Navano AI...')}
							onChange={(e) => setDraft(e.target.value)}
							onKeyDown={onKeyDown}
						/>
						<button type="submit" disabled={!draft.trim() || loading} aria-label={t('Send')}>
							<ArrowUpwardRoundedIcon />
						</button>
					</form>
					<p className={'ai-note'}>{t('AI can make mistakes. Check product details before ordering.')}</p>
				</>
			)}
		</section>
	);
};

export default AssistantPanel;
