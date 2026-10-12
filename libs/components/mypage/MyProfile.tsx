import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Button, Stack, Typography } from '@mui/material';
import axios from 'axios';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import { Messages, REACT_APP_API_URL } from '../../config';
import { getJwtToken, updateStorage, updateUserInfo } from '../../auth';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberUpdate } from '../../types/member/member.update';
import { Member } from '../../types/member/member';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { GET_MEMBER } from '../../../apollo/user/query';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';
import { MemberStatus, MemberType } from '../../enums/member.enum';
import { memberRef, memberRoleLabel } from './MyMenu';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import ContactPageOutlinedIcon from '@mui/icons-material/ContactPageOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import AddIcon from '@mui/icons-material/Add';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalFloristOutlinedIcon from '@mui/icons-material/LocalFloristOutlined';

const DESC_MAX = 500;

const statusLabel: Record<string, string> = {
	[MemberStatus.ACTIVE]: 'Active',
	[MemberStatus.BLOCK]: 'Blocked',
	[MemberStatus.DELETE]: 'Deleted',
};

const MyProfile: NextPage = ({ initialValues, ...props }: any) => {
	const device = useDeviceDetect();
	const token = getJwtToken();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const [updateData, setUpdateData] = useState<MemberUpdate>(initialValues);

	/** APOLLO REQUESTS **/
	const [updateMember] = useMutation(UPDATE_MEMBER);

	const { data: getMemberData, refetch: getMemberRefetch } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: user?._id },
		skip: !user?._id,
	});
	const member: Member | undefined = getMemberData?.getMember;

	/** LIFECYCLES **/
	const resetForm = () => {
		setUpdateData({
			...initialValues,
			memberNick: user.memberNick,
			memberPhone: user.memberPhone,
			memberFullName: user.memberFullName ?? '',
			memberAddress: user.memberAddress ?? '',
			memberDesc: user.memberDesc ?? '',
			memberImage: user.memberImage,
		});
	};

	useEffect(() => {
		resetForm();
	}, [user]);

	/** HANDLERS **/
	const uploadImage = async (e: any) => {
		try {
			const image = e.target.files[0];
			if (!image) return;

			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target)
				  }`,
					variables: {
						file: null,
						target: 'member',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.file'],
				}),
			);
			formData.append('0', image);

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImage = response.data.data.imageUploader;
			setUpdateData((prev) => ({ ...prev, memberImage: responseImage }));

			return `${REACT_APP_API_URL}/${responseImage}`;
		} catch (err) {
			console.log('Error, uploadImage:', err);
		} finally {
			e.target.value = '';
		}
	};

	const updateProfileHandler = useCallback(async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			const input: MemberUpdate = { ...updateData, _id: user._id };
			// Do not save the local placeholder image as the member image
			if (input.memberImage?.startsWith('/img/')) delete input.memberImage;
			// Optional fields: the backend validates their length, so do not send them empty
			if (!input.memberFullName?.trim()) delete input.memberFullName;
			if (!input.memberDesc?.trim()) delete input.memberDesc;

			const result = await updateMember({ variables: { input } });
			const jwtToken = result?.data?.updateMember?.accessToken;
			updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
			await getMemberRefetch();
			await sweetMixinSuccessAlert('Information updated successfully.');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [updateData, user]);

	const doDisabledCheck = () => {
		if (
			updateData.memberNick === '' ||
			updateData.memberPhone === '' ||
			updateData.memberAddress === '' ||
			updateData.memberImage === ''
		) {
			return true;
		}
	};

	const isStore = user?.memberType === MemberType.AGENT;
	const isActive = user?.memberStatus === MemberStatus.ACTIVE;
	const roleLabel = t(memberRoleLabel(user?.memberType));
	const imageSrc = updateData?.memberImage
		? `${REACT_APP_API_URL}/${updateData?.memberImage}`
		: `/img/profile/defaultUser.svg`;
	const descLength = updateData.memberDesc?.length ?? 0;
	const joinedAt = member?.createdAt ? moment(member.createdAt) : null;
	const primaryAction = isStore
		? { category: 'addProduct', label: 'Add Product' }
		: { category: 'writeArticle', label: 'Write Article' };

	const metrics = [
		{
			label: 'Member since',
			value: joinedAt ? joinedAt.format('MMMM YYYY') : '—',
			note: joinedAt ? joinedAt.fromNow() : '',
		},
		isStore
			? { label: 'Products', value: member?.memberProducts ?? user.memberProducts, note: t('Listed in your store') }
			: { label: 'Articles', value: member?.memberArticles ?? user.memberArticles, note: t('Posted in community') },
		{
			label: 'Followers',
			value: member?.memberFollowers ?? 0,
			note: `${member?.memberFollowings ?? 0} ${t('Followings')}`,
		},
		{ label: 'Likes', value: member?.memberLikes ?? user.memberLikes, note: `${member?.memberViews ?? user.memberViews} ${t('Views')}` },
	];

	const activityTiles = [
		{ category: 'myFavorites', label: 'My Favorites', note: t('Saved products'), icon: <FavoriteBorderIcon /> },
		{
			category: 'myArticles',
			label: 'Articles',
			note: `${member?.memberArticles ?? user.memberArticles} ${t('posted')}`,
			icon: <ArticleOutlinedIcon />,
		},
		{
			category: 'followings',
			label: 'My Followings',
			note: `${member?.memberFollowings ?? 0} ${t('stores and people')}`,
			icon: <PersonAddAltOutlinedIcon />,
		},
	];

	const quickLinks = [
		...(isStore ? [{ category: 'myProducts', label: 'My Products', note: t('Manage your listings') }] : []),
		{ category: 'recentlyVisited', label: 'Recently Visited', note: t('Products you viewed') },
		{ category: 'followers', label: 'My Followers', note: `${member?.memberFollowers ?? 0} ${t('Followers')}` },
	];

	if (device === 'mobile') {
		return <>MY PROFILE PAGE MOBILE</>;
	} else
		return (
			<div id="my-profile-page">
				{/* Page header */}
				<Stack className="profile-header">
					<Stack>
						<Stack className="breadcrumb" component={'nav'} aria-label={'breadcrumb'}>
							<span>{t('Account')}</span>
							<span className="sep">/</span>
							<span>{t('Manage Account')}</span>
							<span className="sep">/</span>
							<span className="current">{t('My Profile')}</span>
						</Stack>
						<Typography component={'h1'} className="page-title">
							{t('My Profile')}
						</Typography>
						<Typography className="page-desc">{t('Manage how stores and customers see you on Navano')}</Typography>
					</Stack>
					<Stack className="header-actions">
						<Link href={`/member?memberId=${user?._id}`} className="mp-btn mp-btn-secondary">
							<OpenInNewIcon />
							<span>{t('View public page')}</span>
						</Link>
						<Link
							href={{ pathname: '/mypage', query: { category: primaryAction.category } }}
							scroll={false}
							className="mp-btn mp-btn-primary"
						>
							<AddIcon />
							<span>{t(primaryAction.label)}</span>
						</Link>
					</Stack>
				</Stack>

				{/* Hero card */}
				<section className="profile-hero">
					<div className="hero-cover">
						<span className="hero-watermark" aria-hidden>
							NAVANO
						</span>
						<span className="cover-pill">
							<span className={`pulse ${isActive ? '' : 'off'}`} aria-hidden />
							<span>{t(isActive ? 'Account active' : statusLabel[user?.memberStatus] ?? 'Inactive')}</span>
							<strong>{roleLabel}</strong>
						</span>
					</div>
					<Stack className="hero-identity">
						<Stack className="hero-left">
							<label htmlFor="profile-image-input" className="hero-avatar" title={t('Change photo')}>
								<span className="avatar-frame">
									<img src={imageSrc} alt={user?.memberNick ?? 'member'} />
									{isActive && <span className="live-dot" aria-hidden />}
								</span>
								<span className="avatar-overlay">
									<PhotoCameraOutlinedIcon />
									<span className="overlay-title">{t('Change photo')}</span>
									<span className="overlay-hint">{t('JPG, JPEG or PNG')}</span>
								</span>
							</label>
							<Stack className="hero-text">
								<Stack className="hero-name-row">
									<Typography component={'h2'} className="hero-name">
										{user?.memberFullName || user?.memberNick}
									</Typography>
									<span className="role-badge">
										<VerifiedIcon />
										{roleLabel}
									</span>
									<span className="ref-chip">{memberRef(user?._id)}</span>
								</Stack>
								<Stack className="hero-meta">
									<span className="strong">
										<AlternateEmailIcon />
										{user?.memberNick}
									</span>
									{user?.memberPhone && (
										<>
											<span className="dot" aria-hidden>
												•
											</span>
											<span className="mono">
												<PhoneOutlinedIcon />
												{user.memberPhone}
											</span>
										</>
									)}
									{user?.memberAddress && (
										<>
											<span className="dot" aria-hidden>
												•
											</span>
											<span>
												<PlaceOutlinedIcon />
												{user.memberAddress}
											</span>
										</>
									)}
								</Stack>
							</Stack>
						</Stack>
						<Stack className="hero-actions">
							<input
								type="file"
								hidden
								id="profile-image-input"
								onChange={uploadImage}
								accept="image/jpg, image/jpeg, image/png"
							/>
							<label htmlFor="profile-image-input" className="mp-btn mp-btn-secondary">
								<FileUploadOutlinedIcon />
								<span>{t('Upload new photo')}</span>
							</label>
						</Stack>
					</Stack>
					<div className="hero-metrics">
						{metrics.map((metric) => (
							<div className="metric" key={metric.label}>
								<span className="metric-label">{t(metric.label)}</span>
								<span className="metric-value">{metric.value}</span>
								<span className="metric-note">{metric.note}</span>
							</div>
						))}
					</div>
				</section>

				{/* Main grid */}
				<div className="profile-grid">
					<Stack className="grid-main">
						<section className="mp-card">
							<header className="card-head">
								<Stack className="card-title">
									<ContactPageOutlinedIcon />
									<Typography component={'h3'}>{t('Profile details')}</Typography>
								</Stack>
								<span className="card-tag">{t('Public profile')}</span>
							</header>
							<div className="form-grid">
								<label className="field">
									<span className="field-label">
										<span>{t('Full name')}</span>
										<span className="field-hint accent">{t('Shown on your page')}</span>
									</span>
									<span className="input-wrap">
										<input
											type="text"
											maxLength={100}
											placeholder={t('Your full name')}
											value={updateData.memberFullName ?? ''}
											onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberFullName: value })}
										/>
										<VerifiedOutlinedIcon className="suffix-icon" />
									</span>
								</label>
								<label className="field">
									<span className="field-label">
										<span>{t('Nickname')}</span>
										<span className="field-hint">{t('3–12 characters')}</span>
									</span>
									<span className="input-wrap">
										<span className="prefix">@</span>
										<input
											type="text"
											maxLength={12}
											className="mono"
											placeholder={t('Your nickname')}
											value={updateData.memberNick ?? ''}
											onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberNick: value })}
										/>
									</span>
								</label>
								<label className="field">
									<span className="field-label">
										<span>{t('Phone')}</span>
										<span className="field-hint accent">{t('Used to log in')}</span>
									</span>
									<span className="input-wrap">
										<span className="prefix">
											<PhoneOutlinedIcon />
										</span>
										<input
											type="tel"
											className="mono"
											placeholder={t('Your phone')}
											value={updateData.memberPhone ?? ''}
											onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberPhone: value })}
										/>
									</span>
								</label>
								<label className="field">
									<span className="field-label">
										<span>{t('Role')}</span>
										<span className="field-hint">{t('Read only')}</span>
									</span>
									<span className="input-wrap readonly">
										<input type="text" value={roleLabel} readOnly tabIndex={-1} />
										<StorefrontOutlinedIcon className="suffix-icon" />
									</span>
								</label>
								<label className="field span-2">
									<span className="field-label">
										<span>{t('Address')}</span>
										<span className="field-hint">{t('Used for deliveries')}</span>
									</span>
									<span className="input-wrap">
										<input
											type="text"
											placeholder={t('Your address')}
											value={updateData.memberAddress ?? ''}
											onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberAddress: value })}
										/>
										<PlaceOutlinedIcon className="suffix-icon" />
									</span>
								</label>
								<label className="field span-2">
									<span className="field-label">
										<span>{t('About me')}</span>
										<span className="field-hint mono">
											{descLength} / {DESC_MAX}
										</span>
									</span>
									<textarea
										rows={3}
										maxLength={DESC_MAX}
										placeholder={t('Tell customers a little about yourself')}
										value={updateData.memberDesc ?? ''}
										onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberDesc: value })}
									/>
								</label>
							</div>
						</section>

						<section className="mp-card">
							<header className="card-head">
								<Stack className="card-title">
									<HubOutlinedIcon />
									<Typography component={'h3'}>{t('Your activity')}</Typography>
								</Stack>
								<Link
									href={{ pathname: '/mypage', query: { category: 'writeArticle' } }}
									scroll={false}
									className="card-link"
								>
									<AddIcon />
									<span>{t('Write Article')}</span>
								</Link>
							</header>
							<div className="tile-grid">
								{activityTiles.map((tile) => (
									<Link
										key={tile.category}
										href={{ pathname: '/mypage', query: { category: tile.category } }}
										scroll={false}
										className="activity-tile"
									>
										<span className="icon-slot">{tile.icon}</span>
										<span className="tile-text">
											<span className="tile-title">{t(tile.label)}</span>
											<span className="tile-note">{tile.note}</span>
										</span>
										<span className="tile-dot" aria-hidden />
									</Link>
								))}
							</div>
						</section>

						<section className="save-bar">
							<Stack className="save-note">
								<span className="info-circle">
									<InfoOutlinedIcon />
								</span>
								<span>{t('Changes are saved to your public profile right away')}</span>
							</Stack>
							<Stack className="save-actions">
								<button type="button" className="mp-btn mp-btn-text" onClick={resetForm}>
									{t('Discard changes')}
								</button>
								<Button className="mp-btn mp-btn-primary" onClick={updateProfileHandler} disabled={doDisabledCheck()}>
									<CheckIcon />
									<span>{t('Update profile')}</span>
								</Button>
							</Stack>
						</section>
					</Stack>

					<Stack className="grid-side">
						<section className="mp-card">
							<header className="card-head">
								<Stack className="card-title">
									<WorkspacePremiumOutlinedIcon />
									<Typography component={'h3'}>{t('Account summary')}</Typography>
								</Stack>
								<span className={`status-dot ${isActive ? '' : 'off'}`} title={t(statusLabel[user?.memberStatus] ?? '')} />
							</header>
							<Stack className="list-items">
								<div className="list-item">
									<span className="icon-slot accent">
										<StorefrontOutlinedIcon />
									</span>
									<span className="item-body">
										<span className="item-top">
											<span className="item-title">{roleLabel}</span>
											<span className="item-badge accent">{t(statusLabel[user?.memberStatus] ?? '—')}</span>
										</span>
										<span className="item-sub mono">{memberRef(user?._id)}</span>
										<span className="item-sub">{joinedAt ? `${t('Joined')} ${joinedAt.format('YYYY.MM.DD')}` : ''}</span>
									</span>
								</div>
								<div className="list-item">
									<span className="icon-slot">
										<ShieldOutlinedIcon />
									</span>
									<span className="item-body">
										<span className="item-top">
											<span className="item-title">
												{t('Rank')} {member?.memberRank ?? user.memberRank}
											</span>
											<span className="item-badge">{t('Points')}</span>
										</span>
										<span className="item-sub mono">
											{member?.memberPoints ?? user.memberPoints} {t('Points')} • {member?.memberViews ?? user.memberViews}{' '}
											{t('Views')}
										</span>
									</span>
								</div>
								<Link href={`/member?memberId=${user?._id}`} className="row-button">
									<span>
										<OpenInNewIcon />
										{t('View public page')}
									</span>
									<ArrowForwardIcon />
								</Link>
							</Stack>
						</section>

						<section className="mp-card">
							<header className="card-head">
								<Stack className="card-title">
									<ExploreOutlinedIcon />
									<Typography component={'h3'}>{t('Quick links')}</Typography>
								</Stack>
								<span className="card-tag">
									{quickLinks.length} {t('links')}
								</span>
							</header>
							<Stack className="list-items">
								{quickLinks.map((link, index) => (
									<Link
										key={link.category}
										href={{ pathname: '/mypage', query: { category: link.category } }}
										scroll={false}
										className={`link-item ${index === 0 ? 'featured' : ''}`}
									>
										<span className="item-title">{t(link.label)}</span>
										<span className="item-sub">{link.note}</span>
										<ArrowForwardIcon />
									</Link>
								))}
							</Stack>
						</section>

						<section className="seal-card">
							<span className="seal-icon">
								<LocalFloristOutlinedIcon />
							</span>
							<span className="seal-text">
								<span className="seal-title">{t('Navano member')}</span>
								<span className="seal-sub">{t('Flowers, chocolates and cakes from local stores')}</span>
							</span>
						</section>
					</Stack>
				</div>
			</div>
		);
};

MyProfile.defaultProps = {
	initialValues: {
		_id: '',
		memberImage: '',
		memberNick: '',
		memberPhone: '',
		memberFullName: '',
		memberAddress: '',
		memberDesc: '',
	},
};

export default MyProfile;
