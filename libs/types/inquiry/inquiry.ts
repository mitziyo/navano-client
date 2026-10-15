import { InquiryStatus, InquiryType } from '../../enums/inquiry.enum';
import { Member } from '../member/member';
import { TotalCounter } from '../product/product';

export interface Inquiry {
	_id: string;
	inquiryType: InquiryType;
	inquiryStatus: InquiryStatus;
	inquiryTitle: string;
	inquiryContent: string;
	inquiryAnswer?: string;
	answeredAt?: Date;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation (admin) **/
	memberData?: Member;
}

export interface Inquiries {
	list: Inquiry[];
	metaCounter: TotalCounter[];
}

export interface InquiryInput {
	inquiryType: InquiryType;
	inquiryTitle: string;
	inquiryContent: string;
}
