import React from 'react';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { assistantOpenVar, chatOpenVar } from '../../../apollo/store';

// "Navano AI" pill, last item of the navbar actions; the panel and the live chat never open together
const AssistantButton = () => {
	const { t } = useTranslation('common');
	const open = useReactiveVar(assistantOpenVar);

	return (
		<button
			type="button"
			className={`ai-btn ${open ? 'is-open' : ''}`}
			aria-haspopup="dialog"
			aria-expanded={open}
			aria-controls="navano-ai-panel"
			onClick={() => {
				if (!open) chatOpenVar(false);
				assistantOpenVar(!open);
			}}
		>
			<AutoAwesomeIcon aria-hidden />
			<span>{t('Navano AI')}</span>
		</button>
	);
};

export default AssistantButton;
