import decodeJWT from 'jwt-decode';
import { initializeApollo } from '../../apollo/client';
import { sessionReadyVar, userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { LOGIN, SIGN_UP } from '../../apollo/user/mutation';
import { CHECK_AUTH } from '../../apollo/user/query';

const TOKEN_KEY = 'accessToken';

// A token that cannot be decoded counts as expired
export const isTokenExpired = (token: string): boolean => {
	try {
		const { exp } = decodeJWT<{ exp?: number }>(token);
		return typeof exp === 'number' && exp * 1000 <= Date.now();
	} catch {
		return true;
	}
};

// Returns '' (and drops the stored token) when the token is missing or expired
export function getJwtToken(): any {
	if (typeof window === 'undefined') return;
	const token = localStorage.getItem(TOKEN_KEY) ?? '';
	if (token && isTokenExpired(token)) {
		localStorage.removeItem(TOKEN_KEY);
		return '';
	}
	return token;
}

export function setJwtToken(token: string) {
	localStorage.setItem(TOKEN_KEY, token);
}

// Errors are not caught here: the Apollo error link already shows the server message once, and the caller decides the rest
export const logIn = async (nick: string, password: string): Promise<void> => {
	const apolloClient = await initializeApollo();
	const result = await apolloClient.mutate({
		mutation: LOGIN,
		variables: { input: { memberNick: nick, memberPassword: password } },
		fetchPolicy: 'network-only',
	});
	saveToken(result?.data?.login?.accessToken);
};

export const signUp = async (nick: string, password: string, phone: string, type: string): Promise<void> => {
	const apolloClient = await initializeApollo();
	const result = await apolloClient.mutate({
		mutation: SIGN_UP,
		variables: { input: { memberNick: nick, memberPassword: password, memberPhone: phone, memberType: type } },
		fetchPolicy: 'network-only',
	});
	saveToken(result?.data?.signup?.accessToken);
};

const saveToken = (jwtToken?: string) => {
	if (!jwtToken) return;
	updateStorage({ jwtToken });
	updateUserInfo(jwtToken);
};

export const updateStorage = ({ jwtToken }: { jwtToken: any }) => {
	setJwtToken(jwtToken);
};

// Single place that turns the stored token into userVar; runs once from pages/_app.tsx
export const restoreSession = () => {
	const jwt = getJwtToken();
	if (jwt) {
		updateUserInfo(jwt);
		verifySession();
	} else deleteUserInfo();
	sessionReadyVar(true);
};

// Public pages accept a bad token as a guest, so ask the server once; a 401 is handled by the Apollo error link (expireSession)
const verifySession = () => {
	initializeApollo()
		.query({ query: CHECK_AUTH, fetchPolicy: 'network-only' })
		.catch(() => undefined);
};

// Login / logout in another tab changes localStorage; mirror it here
export const watchSession = () => {
	const onStorage = (e: StorageEvent) => {
		if (e.key === TOKEN_KEY || e.key === null) restoreSession();
	};
	window.addEventListener('storage', onStorage);
	return () => window.removeEventListener('storage', onStorage);
};

// The server rejected the token (expired or signed with an old secret): drop it without a reload
export const expireSession = () => {
	deleteStorage();
	deleteUserInfo();
};

export const updateUserInfo = (jwtToken: any) => {
	if (!jwtToken) return false;

	const claims = decodeJWT<CustomJwtPayload>(jwtToken);
	userVar({
		_id: claims._id ?? '',
		memberType: claims.memberType ?? '',
		memberStatus: claims.memberStatus ?? '',
		memberAuthType: claims.memberAuthType,
		memberPhone: claims.memberPhone ?? '',
		memberNick: claims.memberNick ?? '',
		memberFullName: claims.memberFullName ?? '',
		memberImage:
			claims.memberImage === null || claims.memberImage === undefined
				? '/img/profile/defaultUser.svg'
				: `${claims.memberImage}`,
		memberAddress: claims.memberAddress ?? '',
		memberDesc: claims.memberDesc ?? '',
		memberProducts: claims.memberProducts,
		memberRank: claims.memberRank,
		memberArticles: claims.memberArticles,
		memberPoints: claims.memberPoints,
		memberLikes: claims.memberLikes,
		memberViews: claims.memberViews,
		memberWarnings: claims.memberWarnings,
		memberBlocks: claims.memberBlocks,
	});
};

export const logOut = () => {
	deleteStorage();
	deleteUserInfo();
	window.location.reload();
};

const deleteStorage = () => {
	localStorage.removeItem(TOKEN_KEY);
};

const deleteUserInfo = () => {
	userVar({
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
};
