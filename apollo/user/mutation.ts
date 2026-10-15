import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const SIGN_UP = gql`
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberWarnings
			memberBlocks
			memberProducts
			memberRank
			memberArticles
			memberPoints
			memberLikes
			memberViews
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberWarnings
			memberBlocks
			memberProducts
			memberRank
			memberPoints
			memberLikes
			memberViews
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

// Both are sent with the httpOnly refresh cookie (libs/auth postWithCookie)
export const REFRESH_TOKEN = gql`
	mutation RefreshToken {
		refreshToken {
			accessToken
		}
	}
`;

export const LOGOUT = gql`
	mutation Logout {
		logout
	}
`;

export const UPDATE_MEMBER = gql`
	mutation UpdateMember($input: MemberUpdate!) {
		updateMember(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberProducts
			memberRank
			memberArticles
			memberPoints
			memberLikes
			memberViews
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const LIKE_TARGET_MEMBER = gql`
	mutation LikeTargetMember($input: String!) {
		likeTargetMember(memberId: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberProducts
			memberRank
			memberPoints
			memberLikes
			memberViews
			deletedAt
			createdAt
			updatedAt
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

/**************************
 *         PRODUCT        *
 *************************/

export const CREATE_PRODUCT = gql`
	mutation CreateProduct($input: ProductInput!) {
		createProduct(input: $input) {
			_id
			productType
			productStatus
			productLocation
			productAddress
			productOccasion
			productTitle
			productPrice
			productItemCount
			productViews
			productLikes
			productImages
			productDesc
			memberId
			soldAt
			deletedAt
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_PRODUCT = gql`
	mutation UpdateProduct($input: ProductUpdate!) {
		updateProduct(input: $input) {
			_id
			productType
			productStatus
			productLocation
			productAddress
			productOccasion
			productTitle
			productPrice
			productItemCount
			productViews
			productLikes
			productImages
			productDesc
			memberId
			soldAt
			deletedAt
			createdAt
			updatedAt
		}
	}
`;

export const LIKE_TARGET_PRODUCT = gql`
	mutation LikeTargetProduct($input: String!) {
		likeTargetProduct(productId: $input) {
			_id
			productType
			productStatus
			productLocation
			productAddress
			productOccasion
			productTitle
			productPrice
			productItemCount
			productViews
			productLikes
			productImages
			productDesc
			memberId
			soldAt
			deletedAt
			createdAt
			updatedAt
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const CREATE_BOARD_ARTICLE = gql`
	mutation CreateBoardArticle($input: BoardArticleInput!) {
		createBoardArticle(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_BOARD_ARTICLE = gql`
	mutation UpdateBoardArticle($input: BoardArticleUpdate!) {
		updateBoardArticle(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const LIKE_TARGET_BOARD_ARTICLE = gql`
	mutation LikeTargetBoardArticle($input: String!) {
		likeTargetBoardArticle(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const CREATE_COMMENT = gql`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_COMMENT = gql`
	mutation UpdateComment($input: CommentUpdate!) {
		updateComment(input: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/

export const SUBSCRIBE = gql`
	mutation Subscribe($input: String!) {
		subscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

export const UNSUBSCRIBE = gql`
	mutation Unsubscribe($input: String!) {
		unsubscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *       NAVANO AI       *
 *************************/

export const ASK_ASSISTANT = gql`
	mutation AskAssistant($input: AssistantInput!) {
		askAssistant(input: $input) {
			text
			products {
				_id
				productType
				productStatus
				productLocation
				productOccasion
				productTitle
				productPrice
				productImages
			}
		}
	}
`;

/**************************
 *           CS           *
 *************************/

export const CREATE_INQUIRY = gql`
	mutation CreateInquiry($input: InquiryInput!) {
		createInquiry(input: $input) {
			_id
			inquiryStatus
		}
	}
`;

export const REMOVE_INQUIRY = gql`
	mutation RemoveInquiry($input: String!) {
		removeInquiry(inquiryId: $input) {
			_id
			inquiryStatus
		}
	}
`;

/**************************
 *      NOTIFICATIONS     *
 *************************/

export const READ_NOTIFICATIONS = gql`
	mutation ReadNotifications($input: ReadNotificationsInput!) {
		readNotifications(input: $input)
	}
`;

export const READ_ALL_NOTIFICATIONS = gql`
	mutation ReadAllNotifications {
		readAllNotifications
	}
`;
