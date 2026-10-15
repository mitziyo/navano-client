import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_ALL_MEMBERS_BY_ADMIN = gql`
	query GetAllMembersByAdmin($input: MembersInquiry!) {
		getAllMembersByAdmin(input: $input) {
			list {
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
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         PRODUCT        *
 *************************/

export const GET_ALL_PRODUCTS_BY_ADMIN = gql`
	query GetAllProductsByAdmin($input: AllProductsInquiry!) {
		getAllProductsByAdmin(input: $input) {
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
 *      BOARD-ARTICLE     *
 *************************/

export const GET_ALL_BOARD_ARTICLES_BY_ADMIN = gql`
	query GetAllBoardArticlesByAdmin($input: AllBoardArticlesInquiry!) {
		getAllBoardArticlesByAdmin(input: $input) {
			list {
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

export const GET_ALL_NOTICES_BY_ADMIN = gql`
	query GetAllNoticesByAdmin($input: AllNoticesInquiry!) {
		getAllNoticesByAdmin(input: $input) {
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
				updatedAt
				memberData {
					_id
					memberNick
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ALL_INQUIRIES_BY_ADMIN = gql`
	query GetAllInquiriesByAdmin($input: AllInquiriesInquiry!) {
		getAllInquiriesByAdmin(input: $input) {
			list {
				_id
				inquiryType
				inquiryStatus
				inquiryTitle
				inquiryContent
				inquiryAnswer
				answeredAt
				createdAt
				memberData {
					_id
					memberNick
					memberType
					memberImage
					memberPhone
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        DASHBOARD       *
 *************************/

export const GET_ADMIN_STATS = gql`
	query GetAdminStats {
		getAdminStats {
			members {
				...CollectionStatsFields
			}
			products {
				...CollectionStatsFields
			}
			articles {
				...CollectionStatsFields
			}
			inquiries {
				...CollectionStatsFields
			}
			notices {
				...CollectionStatsFields
			}
		}
	}

	fragment CollectionStatsFields on CollectionStats {
		total
		newThisWeek
		byStatus {
			value
			count
		}
		byType {
			value
			count
		}
	}
`;
