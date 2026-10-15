import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

// AuthGuard-only ping: tells whether the stored token is still accepted by the server
export const CHECK_AUTH = gql`
	query CheckAuth {
		checkAuth
	}
`;

export const GET_AGENTS = gql`
	query GetAgents($input: AgentsInquiry!) {
		getAgents(input: $input) {
			list {
				_id
				memberType
				memberStatus
				memberAuthType
				memberPhone
				memberNick
				memberFullName
				memberImage
				memberCover
				memberAddress
				memberDesc
				memberProducts
				memberRank
				memberPoints
				memberLikes
				memberViews
				memberComments
				deletedAt
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER = gql(`
query GetMember($input: String!) {
    getMember(memberId: $input) {
        _id
        memberType
        memberStatus
        memberAuthType
        memberPhone
        memberNick
        memberFullName
        memberImage
        memberCover
        memberAddress
        memberDesc
        memberProducts
        memberArticles
        memberPoints
        memberLikes
        memberViews
        memberFollowings
				memberFollowers
        memberRank
        memberWarnings
        memberBlocks
        deletedAt
        createdAt
        updatedAt
        accessToken
        meFollowed {
					followingId
					followerId
					myFollowing
				}
    }
}
`);

/**************************
 *         PRODUCT        *
 *************************/

export const GET_PRODUCT = gql`
	query GetProduct($input: String!) {
		getProduct(productId: $input) {
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
			memberData {
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
				memberPoints
				memberLikes
				memberViews
				deletedAt
				createdAt
				updatedAt
				accessToken
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_PRODUCT_FACETS = gql`
	query GetProductFacets {
		getProductFacets {
			total
			locations {
				value
				count
			}
			types {
				value
				count
			}
			occasions {
				value
				count
			}
		}
	}
`;

export const GET_PRODUCTS = gql`
	query GetProducts($input: ProductsInquiry!) {
		getProducts(input: $input) {
			list {
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
				productRank
				productImages
				productDesc
				memberId
				soldAt
				deletedAt
				createdAt
				updatedAt
				memberData {
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
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AGENT_PRODUCTS = gql`
	query GetAgentProducts($input: AgentProductsInquiry!) {
		getAgentProducts(input: $input) {
			list {
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
			metaCounter {
				total
			}
		}
	}
`;

export const GET_FAVORITES = gql`
	query GetFavorites($input: OrdinaryInquiry!) {
		getFavorites(input: $input) {
			list {
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
				productComments
				productRank
				productImages
				productDesc
				memberId
				soldAt
				deletedAt
				createdAt
				updatedAt
				memberData {
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
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_VISITED = gql`
	query GetVisited($input: OrdinaryInquiry!) {
		getVisited(input: $input) {
			list {
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
				productComments
				productRank
				productImages
				productDesc
				memberId
				soldAt
				deletedAt
				createdAt
				updatedAt
				memberData {
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
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_BOARD_ARTICLE = gql`
	query GetBoardArticle($input: String!) {
		getBoardArticle(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			articleComments
			memberId
			createdAt
			updatedAt
			memberData {
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
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_BOARD_ARTICLES = gql`
	query GetBoardArticles($input: BoardArticlesInquiry!) {
		getBoardArticles(input: $input) {
			list {
				_id
				articleCategory
				articleStatus
				articleTitle
				articleContent
				articleImage
				articleViews
				articleLikes
				articleComments
				memberId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				memberData {
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
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				updatedAt
				memberData {
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
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/
export const GET_MEMBER_FOLLOWERS = gql`
	query GetMemberFollowers($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
				followerData {
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
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				followingData {
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
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *           CS           *
 *************************/

export const GET_NOTICES = gql`
	query GetNotices($input: NoticesInquiry!) {
		getNotices(input: $input) {
			list {
				_id
				noticeCategory
				noticeStatus
				noticeTopic
				noticeTitle
				noticeContent
				noticeTeam
				noticeLink
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MY_INQUIRIES = gql`
	query GetMyInquiries($input: InquiriesInquiry!) {
		getMyInquiries(input: $input) {
			list {
				_id
				inquiryType
				inquiryStatus
				inquiryTitle
				inquiryContent
				inquiryAnswer
				answeredAt
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      NOTIFICATIONS     *
 *************************/

export const GET_UNREAD_NOTIFICATIONS = gql`
	query GetUnreadNotifications {
		getUnreadNotifications
	}
`;

export const GET_NOTIFICATIONS = gql`
	query GetNotifications($input: NotificationsInquiry!) {
		getNotifications(input: $input) {
			list {
				_id
				notificationType
				notificationStatus
				notificationGroup
				notificationTitle
				notificationDesc
				authorId
				productId
				articleId
				createdAt
				authorData {
					_id
					memberNick
					memberImage
					memberType
				}
			}
			metaCounter {
				total
			}
		}
	}
`;
