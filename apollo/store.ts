import { makeVar } from '@apollo/client';

import { CustomJwtPayload } from '../libs/types/customJwtPayload';
export const themeVar = makeVar({});

export const userVar = makeVar<CustomJwtPayload>({
	_id: '',
	memberType: '',
	memberStatus: '',
	memberAuthType: '',
	memberPhone: '',
	memberNick: '',
	memberFullName: '',
	memberImage: '',
	memberAddress: '',
	memberDesc: '',
	memberProducts: 0,
	memberRank: 0,
	memberArticles: 0,
	memberPoints: 0,
	memberLikes: 0,
	memberViews: 0,
	memberWarnings: 0,
	memberBlocks: 0,
});

// True once restoreSession() has read the stored token (pages wait for it before redirecting)
export const sessionReadyVar = makeVar<boolean>(false);

// Open state of the floating chat, so pages (e.g. CS) can open it
export const chatOpenVar = makeVar<boolean>(false);

// @ts-ignore
export const socketVar = makeVar<WebSocket>();

// Open state of the Navano AI assistant panel (navbar button)
export const assistantOpenVar = makeVar<boolean>(false);
