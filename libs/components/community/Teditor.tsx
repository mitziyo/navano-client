import React, { useMemo, useRef, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'next-i18next';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { Editor } from '@toast-ui/react-editor';
import { getJwtToken } from '../../auth';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import axios from 'axios'; 
import { T } from '../../types/common'; //@ts-ignore
import '@toast-ui/editor/dist/toastui-editor.css';  
import { useMutation } from '@apollo/client';
import { CREATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { Message } from '../../enums/common.enum';
import { sweetErrorAlert, sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';

// Same limits as the API (libs/config validMimeTypes, graphqlUploadExpress maxFileSize)
const IMAGE_TYPES = ['image/png', 'image/jpg', 'image/jpeg'];
const MAX_IMAGE_BYTES = 15_000_000;

const TuiEditor = () => {
	const editorRef = useRef<Editor>(null),
		token = getJwtToken(),
		router = useRouter();
	const { t } = useTranslation('common');
	const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(BoardArticleCategory.FREE);

	/** APOLLO REQUESTS **/
	const [createBoardArticle] = useMutation(CREATE_BOARD_ARTICLE);

	const memoizedValues = useMemo(() => {
		const articleTitle = '',
			articleContent = '',
			articleImage = '';

		return { articleTitle, articleContent, articleImage };
	}, []);

	/** HANDLERS **/
	// Returns the public URL, or null when the upload failed (the caller then inserts nothing)
	const uploadImage = async (image: File): Promise<string | null> => {
		if (!IMAGE_TYPES.includes(image.type)) {
			await sweetErrorAlert(t('Please use a JPG or PNG image'));
			return null;
		}
		if (image.size > MAX_IMAGE_BYTES) {
			await sweetErrorAlert(t('The image must be smaller than 15 MB'));
			return null;
		}
		try {
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target) 
				  }`,
					variables: {
						file: null,
						target: 'article',
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

			const responseImage = response.data?.data?.imageUploader;
			if (!responseImage) throw new Error(response.data?.errors?.[0]?.message ?? 'Upload failed');
			// The first image becomes the article cover
			if (!memoizedValues.articleImage) memoizedValues.articleImage = responseImage;

			return `${REACT_APP_API_URL}/${responseImage}`;
		} catch (err: any) {
			console.log('Error, uploadImage:', err);
			await sweetErrorAlert(t('The image could not be uploaded, please try again'));
			return null;
		}
	};

	const changeCategoryHandler = (e: any) => {
		setArticleCategory(e.target.value);
	};

	const articleTitleHandler = (e: T) => {
		console.log(e.target.value);
		memoizedValues.articleTitle = e.target.value;
	};

	const handleRegisterButton = async () => {
		try {
			const editor = editorRef.current;
			const articleContent = editor?.getInstance().getHTML() as string;
			memoizedValues.articleContent = articleContent;

			if (memoizedValues.articleContent === '' && memoizedValues.articleTitle === '') {
				throw new Error(Message.INSERT_ALL_INPUTS);
			}

			await createBoardArticle({
				variables: {
					input: { ...memoizedValues, articleCategory },
				},
			});

			await sweetTopSmallSuccessAlert('Article is created successfully', 700);
			await router.push({
				pathname: '/mypage',
				query: {
					category: 'myArticles',
				},
			});
		} catch (err: any) {
			console.log('error =>', err);
			sweetErrorHandling(new Error(Message.INSERT_ALL_INPUTS)).then();
		}
	};

	const doDisabledCheck = () => {
		if (memoizedValues.articleContent === '' || memoizedValues.articleTitle === '') {
			return true;
		}
	};

	return (
		<div className={'article-editor'}>
			<div className={'form-grid'}>
				<label className={'field'}>
					<span className={'field-label'}>{t('Board')}</span>
					<span className={'input-wrap select-wrap'}>
						<select value={articleCategory} onChange={changeCategoryHandler}>
							<option value={BoardArticleCategory.FREE}>{t('Free Board')}</option>
							<option value={BoardArticleCategory.RECOMMEND}>{t('Recommendation')}</option>
							<option value={BoardArticleCategory.NEWS}>{t('News')}</option>
							<option value={BoardArticleCategory.HUMOR}>{t('Humor')}</option>
						</select>
						<ExpandMoreIcon className={'suffix-icon'} aria-hidden />
					</span>
				</label>
				<label className={'field'}>
					<span className={'field-label'}>
						{t('Title')}
						<span className={'field-hint'}>3–50</span>
					</span>
					<span className={'input-wrap'}>
						<input type="text" maxLength={50} placeholder={t('Give your article a title')} onChange={articleTitleHandler} />
					</span>
				</label>
			</div>

			<div className={'editor-frame'}>
				<Editor
					initialValue={'Type here'}
					placeholder={t('Write your story here')}
					previewStyle={'vertical'}
					height={'560px'}
					// @ts-ignore
					initialEditType={'WYSIWYG'}
					toolbarItems={[
						['heading', 'bold', 'italic', 'strike'],
						['image', 'table', 'link'],
						['ul', 'ol', 'task'],
					]}
					ref={editorRef}
					hooks={{
						addImageBlobHook: async (image: any, callback: any) => {
							const uploadedImageURL = await uploadImage(image);
							if (uploadedImageURL) callback(uploadedImageURL);
							return false;
						},
					}}
					events={{
						load: function (param: any) {},
					}}
				/>
			</div>

			<div className={'save-bar'}>
				<span>{t('The first image you add becomes the article cover')}</span>
				<button type="button" className={'mp-btn mp-btn-primary'} onClick={handleRegisterButton}>
					{t('Publish article')}
				</button>
			</div>
		</div>
	);
};

export default TuiEditor;
